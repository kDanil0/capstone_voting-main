import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElectionById, getCandidatesByElection, submitVote } from '../../utils/api';
import { useAuthContext } from '../../utils/AuthContext';
// import ProgressBar from '../../Components/Voting/ProgressBar';
import PositionVoting from '../../Components/Voting/PositionVoting';
import VoteSummary from '../../Components/Voting/VoteSummary';
import NavigationButtons from '../../Components/Voting/NavigationButtons';

const VotingProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch election and candidates data
  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get election details
        const electionResponse = await getElectionById(token, id);
        setElection(electionResponse.election);
        
        // Get candidates grouped by position
        const candidatesResponse = await getCandidatesByElection(id);
        if (candidatesResponse.data) {
          setPositions(candidatesResponse.data);
        } else {
          throw new Error('No position data received');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching voting data:', err);
        setError('Failed to load voting information. Please try again.');
        setLoading(false);
      }
    };

    fetchVotingData();
  }, [id, token]);

  // Handle candidate selection
  const handleSelectCandidate = (positionId, candidateId) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  // Handle vote submission
  const handleSubmitVote = async () => {
    // Check if all positions have a selection (either a candidate or abstain)
    const missingSelections = positions.filter(position => 
      !selectedCandidates[position.position_id]
    );
    
    if (missingSelections.length > 0) {
      alert("Please make a selection for all positions. You can select a candidate or choose to abstain.");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format vote data for API - only include positions with actual candidates (not abstained)
      const votesArray = positions
        .filter(position => {
          // Only include positions where the user selected an actual candidate (not abstaining)
          const selection = selectedCandidates[position.position_id];
          return selection && selection !== 'abstain';
        })
        .map(position => ({
          position_id: parseInt(position.position_id),
          candidate_id: parseInt(selectedCandidates[position.position_id])
        }));
      
      // If no positions have actual votes (all abstained), show warning
      if (votesArray.length === 0) {
        if (!confirm("You've chosen to abstain from all positions. Do you want to continue?")) {
          setSubmitting(false);
          return;
        }
      }
      
      const voteData = {
        election_id: parseInt(id),
        votes: votesArray
      };
      
      // Submit vote using our API function
      const response = await submitVote(token, voteData);
      
      // Handle error response
      if (response.success === false || response.message?.includes('error') || response.status === 'error') {
        setError(response.message || 'Failed to submit vote. Please try again.');
        setSubmitting(false);
        return;
      }
      
      // Show success message
      setSuccessMessage('Your vote has been successfully submitted!');
      
      // After 2 seconds, perform a hard redirect instead of using navigate
      setTimeout(() => {
        // Force a complete page refresh
        window.location.href = `/election/${id}`;
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(`Failed to submit your vote: ${err.message || 'Unknown error'}`);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("VotingProcess component mounted");
    console.log("Election ID:", id);
    console.log("User:", user);
  }, []);

  // Add this debugging code to check the data before showing summary
  useEffect(() => {
    if (showSummary) {
      console.log("Selected Candidates:", selectedCandidates);
      console.log("Positions:", positions);
    }
  }, [showSummary, selectedCandidates, positions]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-[#3F4B8C]">Loading voting ballot...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  // Success state
  if (successMessage) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-green-100 text-green-800 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-xl">{successMessage}</p>
          <p className="mt-4">Redirecting you back to the election page...</p>
        </div>
      </div>
    );
  }

  const currentPosition = positions[currentPositionIndex];
  const progressStep = showSummary ? positions.length + 1 : currentPositionIndex + 1;
  const totalSteps = positions.length + 1; // +1 for summary

  // Calculate if next button should be disabled
  const isNextDisabled = showSummary ? false : !selectedCandidates[currentPosition.position_id];

  return (
    <div className="min-h-screen flex flex-col -mx-8 -mt-8">
      {/* Full-width gray header with no margins */}
      <div className="w-full bg-gray-200 py-6">
        {/* Election Title */}
        <h1 className="text-[#3F4B8C] font-climate text-4xl text-center tracking-wider mb-6">
          {election.election_name}
        </h1>

        {/* Progress Bar - custom style to match image */}
        <div className="w-full px-8">
          <div className="h-2 bg-gray-300 rounded-full">
            <div 
              className="h-2 bg-[#3F4B8C] rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${(progressStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* White Content Section with Border */}
      <div className="flex-grow bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="border border-gray-300 rounded-md p-6">
            {!showSummary ? (
              <PositionVoting 
                position={currentPosition}
                selectedCandidateId={selectedCandidates[currentPosition.position_id]}
                onSelectCandidate={handleSelectCandidate}
              />
            ) : (
              <VoteSummary 
                positions={positions}
                selections={selectedCandidates}
                onEdit={(positionIndex) => {
                  setCurrentPositionIndex(positionIndex);
                  setShowSummary(false);
                }}
              />
            )}

            <NavigationButtons 
              showSummary={showSummary}
              submitting={submitting}
              onPrevious={() => {
                if (currentPositionIndex > 0) {
                  setCurrentPositionIndex(currentPositionIndex - 1);
                } else if (showSummary) {
                  setShowSummary(false);
                  setCurrentPositionIndex(positions.length - 1);
                }
              }}
              onNext={() => {
                if (currentPositionIndex < positions.length - 1) {
                  setCurrentPositionIndex(currentPositionIndex + 1);
                } else {
                  setShowSummary(true);
                }
              }}
              onSubmit={handleSubmitVote}
              isPreviousDisabled={currentPositionIndex === 0 && !showSummary}
              isNextDisabled={isNextDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingProcess;
