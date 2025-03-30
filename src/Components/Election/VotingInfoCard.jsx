import React from 'react';
import { Card, Button, List, Divider, Tag, Space } from 'antd';
import { CheckCircleOutlined, RightOutlined } from '@ant-design/icons';

// Properly memoized component to prevent unnecessary re-renders
const VotingInfoCard = React.memo(({ hasVoted, onVoteClick, electionId, voteSummary, error }) => {
  // Added debugging logs to help diagnose issues
  console.log(`VotingInfoCard rendering with hasVoted=${hasVoted}`, 
    "voteSummary=", Array.isArray(voteSummary) ? voteSummary : "not an array");
  
  return (
    <Card 
      title={<div className="text-[#3F4B8C] font-climate text-xl tracking-widest">VOTING INFORMATION</div>}
      className="h-full"
      style={{ background: 'f9f9f9' }}
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {hasVoted ? (
        <div>
          <Space align="center">
            <CheckCircleOutlined style={{ color: 'green', fontSize: 20 }} />
            <span className="text-lg font-bold text-gray-700">
              YOU HAVE ALREADY VOTED IN THIS ELECTION
            </span>
          </Space>
          
          <Divider />
          
          {Array.isArray(voteSummary) && voteSummary.length > 0 ? (
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Your Vote Summary:</h3>
              <List
                dataSource={voteSummary}
                renderItem={(vote, index) => (
                  <List.Item key={index}>
                    <Card style={{ width: '100%', background: '#f0f2f5' }}>
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {vote?.position_name || 'Unknown Position'}:
                        </span>
                        <span className="text-gray-800">
                          {vote?.candidate_name || 'Unknown Candidate'}
                        </span>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">No vote details available.</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-[#3F4B8C] flex items-center justify-center">
              {/* Empty circle */}
            </div>
          </div>
          
          <p className="mb-6">Cast your vote for each position to participate in this election</p>
          
          <Button 
            type="primary" 
            onClick={onVoteClick}
            style={{ background: '#3F4B8C' }}
            size="large"
          >
            Vote Now <RightOutlined />
          </Button>
        </div>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if any of these props actually changed
  return (
    prevProps.hasVoted === nextProps.hasVoted &&
    prevProps.error === nextProps.error &&
    prevProps.electionId === nextProps.electionId &&
    JSON.stringify(prevProps.voteSummary) === JSON.stringify(nextProps.voteSummary)
  );
});

export default VotingInfoCard; 