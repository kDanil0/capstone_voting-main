import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ElectionInfoCard from "../../Components/Election/ElectionInfoCard";
import VotingInfoCard from "../../Components/Election/VotingInfoCard";
import PositionCard from "../../Components/Election/PositionCard";
import {
  getElectionDetails,
  getElectionById,
  getPublicElectionDetails,
} from "../../utils/api";
import { ClipLoader } from "react-spinners";
import { useAuthContext } from "../../utils/AuthContext";

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageState, setPageState] = useState({
    electionData: null,
    hasVoted: false,
    voteSummary: [],
    loading: true,
    error: null,
    voteError: null,
  });
  const loadingTimeoutRef = useRef(null);
  const { user, token } = useAuthContext();

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
  };

  // Parse a date string and return a valid Date object or null
  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Try direct parsing first
    let date = new Date(dateString);

    // If direct parsing fails, try to handle MM/DD/YYYY format
    if (isNaN(date.getTime())) {
      const dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
      const match = dateString.match(dateRegex);

      if (match) {
        // Parse MM/DD/YYYY format
        date = new Date(match[3], parseInt(match[1]) - 1, parseInt(match[2]));
      }
    }

    return isNaN(date.getTime()) ? null : date;
  };

  // Check if election is currently open for voting
  const checkElectionStatus = () => {
    if (!pageState.electionData) return false;

    const currentDate = new Date();
    const startDate = parseDate(pageState.electionData.votingPeriod.start);
    const endDate = parseDate(pageState.electionData.votingPeriod.end);

    if (!startDate || !endDate) return false;

    return currentDate >= startDate && currentDate <= endDate;
  };

  // Fetch data effect with timeout safety
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // Set a safety timeout to prevent infinite loading
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMounted && pageState.loading) {
        console.log("Safety timeout triggered - stopping load");
        setPageState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    }, 10000); // 10 second timeout

    const fetchData = async () => {
      try {
        // First check cache for election data
        const cacheKey = `election_${id}_data`;
        const cachedData = sessionStorage.getItem(cacheKey);

        // Always start with loading true
        if (isMounted) {
          setPageState((prev) => ({
            ...prev,
            loading: true,
          }));
        }

        // Step 1: Fetch public election data
        const publicResponse = await getPublicElectionDetails(id);

        // Process positions
        const positionsMap = {};

        if (
          publicResponse.positions &&
          Array.isArray(publicResponse.positions)
        ) {
          publicResponse.positions.forEach((position) => {
            positionsMap[position.id] = {
              id: position.id,
              title: position.name,
              candidates: [],
            };
          });

          if (
            publicResponse.candidates &&
            Array.isArray(publicResponse.candidates)
          ) {
            publicResponse.candidates.forEach((candidate) => {
              const positionId = candidate.position_id;
              if (positionsMap[positionId]) {
                positionsMap[positionId].candidates.push({
                  id: candidate.id,
                  name: candidate.user?.name || "Unknown",
                  profile_photo: candidate.profile_photo || null,
                });
              }
            });
          }
        }

        // Format election data
        const formattedElectionData = {
          id: publicResponse.election.id,
          title:
            publicResponse.election.election_name ||
            publicResponse.election.name,
          department:
            publicResponse.election.department || "Department Election",
          status: publicResponse.election.status,
          campaignPeriod: {
            start: formatDate(publicResponse.election.campaign_start_date),
            end: formatDate(publicResponse.election.campaign_end_date),
          },
          votingPeriod: {
            start: formatDate(publicResponse.election.election_start_date),
            end: formatDate(publicResponse.election.election_end_date),
          },
          positions: Object.values(positionsMap),
        };

        // Save to cache
        sessionStorage.setItem(cacheKey, JSON.stringify(formattedElectionData));

        // Step 2: Update with public data immediately so we have content
        if (isMounted) {
          setPageState((prev) => ({
            ...prev,
            electionData: formattedElectionData,
            // Don't set loading=false yet if we need to check vote status
          }));
        }

        // Step 3: If user is logged in, fetch vote status separately
        if (user && token) {
          try {
            const timestamp = Date.now();
            const voteResponse = await getElectionDetails(
              token,
              `${id}?t=${timestamp}`
            );

            // Always finish loading, regardless of vote result
            if (isMounted) {
              setPageState((prev) => {
                let updatedState = {
                  ...prev,
                  loading: false, // Always set loading to false here
                };

                // Check if response is an error response
                if (voteResponse && voteResponse.success === false) {
                  // Display error message but don't block viewing the page
                  console.error("Vote status error:", voteResponse.message);
                  updatedState.voteError = voteResponse.message;
                  return updatedState;
                }

                // If we have a valid vote response, update vote data
                if (voteResponse && typeof voteResponse === "object") {
                  updatedState.hasVoted = voteResponse.hasVoted === true;

                  if (
                    updatedState.hasVoted &&
                    voteResponse.userVoteDetails &&
                    Array.isArray(voteResponse.userVoteDetails)
                  ) {
                    updatedState.voteSummary =
                      voteResponse.userVoteDetails.filter(
                        (detail) => detail && typeof detail === "object"
                      );
                  }
                }

                return updatedState;
              });
            }
          } catch (err) {
            console.error("Vote status error:", err);
            // Always finish loading on error
            if (isMounted) {
              setPageState((prev) => ({
                ...prev,
                loading: false,
                voteError:
                  "Could not verify your vote status. You may view the election, but voting status may be incorrect.",
              }));
            }
          }
        } else {
          // No need to check vote status, finish loading
          if (isMounted) {
            setPageState((prev) => ({
              ...prev,
              loading: false,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading election:", err);
        if (isMounted) {
          setPageState((prev) => ({
            ...prev,
            loading: false,
            error: "Failed to load election details. Please try again.",
          }));
        }
      }
    };

    fetchData();

    // Clean up function
    return () => {
      isMounted = false;
      controller.abort();
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [id, user, token]); // Simplified dependencies

  // Handle vote button click
  const handleVoteNow = () => {
    // Clear any previous errors
    setPageState((prev) => ({ ...prev, voteError: null }));

    // Check if election is open
    const isElectionOpen = checkElectionStatus();
    if (!isElectionOpen) {
      setPageState((prev) => ({
        ...prev,
        voteError:
          "Voting is closed. This election is not currently open for voting.",
      }));
      return;
    }

    // Navigate to login or voting page
    if (!user) {
      navigate("/login", { state: { from: `/election/${id}/vote` } });
    } else {
      navigate(`/election/${id}/vote`);
    }
  };

  // Loading state with react-spinners
  if (pageState.loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <ClipLoader color="#38438c" size={100} speedMultiplier={1} />
          <div className="mt-4 text-[#38438c] font-climate text-2xl">
            Loading Election Details
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{pageState.error}</div>
      </div>
    );
  }

  // Extract values from state object for cleaner JSX
  const { electionData, hasVoted, voteSummary, voteError } = pageState;

  return (
    <>
      {/* Full-width header */}
      <div className="bg-gray-200 -mx-8 -mt-8 mb-5 pt-10 py-2 ">
        <h1 className="text-[#3F4B8C] font-climate text-4xl text-center tracking-wider">
          {electionData.title}
        </h1>
      </div>

      {/* Content area */}
      <div className="h-[calc(100vh-120px)] overflow-hidden">
        <div className="container mx-auto h-full px-4 pb-4">
          <div className=" rounded-lg shadow-xl p-6 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              {/* Left Column */}
              <div className="h-full flex flex-col overflow-hidden">
                <div className="mb-4">
                  <ElectionInfoCard electionData={electionData} />
                </div>
                <div className="flex-grow overflow-hidden">
                  {/* Add key prop to force re-render when status changes */}
                  <VotingInfoCard
                    key={`vote-card-${hasVoted}`}
                    hasVoted={hasVoted}
                    onVoteClick={handleVoteNow}
                    electionId={id}
                    voteSummary={voteSummary}
                    error={voteError}
                  />
                </div>
              </div>

              {/* Right Column - Positions & Candidates */}
              <div className="h-full flex flex-col overflow-hidden">
                <h2 className="text-[#3F4B8C] font-climate text-xl mb-4">
                  POSITION & CANDIDATES
                </h2>

                <div className="flex-grow overflow-y-auto pr-2 candidates-container">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {electionData.positions.map((position) => (
                      <PositionCard key={position.id} position={position} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this style to ensure the page doesn't scroll */}
      <style jsx>{`
        body {
          overflow: hidden;
        }
        .candidates-container::-webkit-scrollbar {
          width: 6px;
        }
        .candidates-container::-webkit-scrollbar-thumb {
          background-color: #3f4b8c;
          border-radius: 3px;
        }
      `}</style>
    </>
  );
};

export default ElectionDetails;
