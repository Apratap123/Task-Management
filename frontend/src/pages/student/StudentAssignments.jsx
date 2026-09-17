import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ExternalLink, CheckCircle } from 'lucide-react';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, groupsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/assignments'),
        axios.get('http://localhost:5000/api/groups')
      ]);
      setAssignments(assignmentsRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmission = async (assignmentId) => {
    if (groups.length === 0) {
      alert("You must create or join a group first!");
      return;
    }
    
    
    const isConfirmed = window.confirm("Yes, I have submitted the work to the OneDrive link. Confirm submission?");
    if (!isConfirmed) return;

    try {
      
      const groupId = groups[0].id;
      
      await axios.post('http://localhost:5000/api/submissions', {
        assignmentId,
        groupId
      });
      
      alert("Submission confirmed!");
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm submission");
    }
  };

  if (loading) return <div>Loading...</div>;

  const myGroupId = groups.length > 0 ? groups[0].id : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
      </div>

      {groups.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are not in a group yet. Please go to <strong>My Group</strong> to create or join one before you can submit assignments.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {assignments.map(assignment => {
          
          const mySubmission = assignment.submissions?.find(sub => sub.groupId === myGroupId);
          const isSubmitted = !!mySubmission;

          return (
            <div key={assignment.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSubmitted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isSubmitted ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                  </div>
                  {isSubmitted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                </div>
                
                <p className="mt-4 text-gray-600 text-sm">
                  {assignment.description || 'No description provided.'}
                </p>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Due Date:</span>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <a 
                  href={assignment.onedriveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open OneDrive Link
                </a>
                
                <button
                  onClick={() => handleConfirmSubmission(assignment.id)}
                  disabled={isSubmitted || groups.length === 0}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors
                    ${isSubmitted 
                      ? 'bg-green-500 cursor-not-allowed' 
                      : groups.length === 0 
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isSubmitted ? 'Submitted' : 'Confirm Submission'}
                </button>
              </div>
            </div>
          );
        })}
        
        {assignments.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No assignments have been posted yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
