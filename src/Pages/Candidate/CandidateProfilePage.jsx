import React, { useState, useEffect } from 'react';
import CandidateProfile from '../../Components/Candidate/CandidateProfile';
import { useAuthContext } from '../../utils/AuthContext';
import { getCandidateId, getCandidate, updateCandidateBio, uploadProfilePhoto } from '../../utils/api';
import { PulseLoader } from 'react-spinners';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingState = () => {
  return (
    <div className="h-full max-w-[1200px] mx-auto pt-4 px-4">
      {/* Loading Header */}
      <div className="flex items-center justify-center mb-6">
        <PulseLoader color="#38438c" size={10} margin={2} />
        <span className="ml-3 text-gray-600 font-medium">
          Loading Candidate Profile...
        </span>
      </div>

      <div className="flex gap-4">
        {/* Main Content Loading State */}
        <div className="flex-grow max-w-[800px]">
          <div className="bg-white rounded-lg shadow mb-4">
            <Skeleton height={192} className="rounded-t-lg" />
            
            <div className="px-4 pb-4">
              <div className="flex items-end -mt-6">
                <Skeleton circle width={128} height={128} className="border-4 border-white" />
                <div className="ml-4 pb-2">
                  <Skeleton width={200} height={24} className="mb-2" />
                  <Skeleton width={150} height={20} count={2} className="mb-1" />
                </div>
              </div>
            </div>

            <div className="border-t px-4 py-3">
              <Skeleton height={100} />
            </div>
          </div>
        </div>

        {/* Documents Section Loading State */}
        <div className="w-[300px]">
          <div className="bg-white rounded-lg shadow p-4">
            <Skeleton height={24} width={150} className="mb-4" />
            <Skeleton height={100} className="mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((_, index) => (
                <Skeleton key={index} height={40} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateProfilePage = () => {
  const { user, token } = useAuthContext();
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!user || user.role_id !== 2) {
        setError("Unauthorized access");
        setIsLoading(false);
        return;
      }

      try {
        const { candidate_id } = await getCandidateId(token, user.student_id);
        const details = await getCandidate(token, candidate_id);
        setCandidateDetails(details);
      } catch (err) {
        setError("Failed to fetch candidate details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [user, token]);

  const handleBioUpdate = async (newBio) => {
    try {
      const response = await updateCandidateBio(token, candidateDetails.id, newBio);
      if (response.success) {
        setCandidateDetails(prev => ({
          ...prev,
          bio: newBio
        }));
      }
    } catch (error) {
      console.error("Failed to update bio:", error);
    }
  };

  const handlePhotoUpload = async (file) => {
    try {
      const response = await uploadProfilePhoto(token, candidateDetails.id, file);
      if (response.path) {
        setCandidateDetails(prev => ({
          ...prev,
          profile_photo: response.path
        }));
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full">
      <CandidateProfile 
        candidateData={candidateDetails}
        onBioUpdate={handleBioUpdate}
        onPhotoUpload={handlePhotoUpload}
      />
    </div>
  );
};

export default CandidateProfilePage; 