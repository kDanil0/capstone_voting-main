import React from 'react';

const NavigationButtons = ({ 
  showSummary, 
  onPrevious, 
  onNext, 
  onSubmit, 
  isPreviousDisabled, 
  isNextDisabled 
}) => {
  return (
    <div className="flex justify-between">
      <button 
        className="bg-gray-300 text-[#3F4B8C] py-2 px-6 rounded-md flex items-center font-assistant"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Previous
      </button>
      
      {showSummary ? (
        <button 
          className="bg-[#3F4B8C] text-white py-2 px-6 rounded-md font-assistant"
          onClick={onSubmit}
        >
          Submit Votes
        </button>
      ) : (
        <button 
          className="bg-[#3F4B8C] text-white py-2 px-6 rounded-md flex items-center font-assistant"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
