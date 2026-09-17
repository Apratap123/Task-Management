import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Link as LinkIcon, Calendar } from 'lucide-react';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [onedriveLink, setOnedriveLink] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/assignments', {
        title,
        description,
        dueDate,
        onedriveLink
      });
      
      
      setTitle('');
      setDescription('');
      setDueDate('');
      setOnedriveLink('');
      setIsFormOpen(false);
      
      fetchAssignments();
    } catch (err) {
      alert('Failed to create assignment');
    }
  };

  if (loading) return <div>Loading Assignments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Assignments</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {isFormOpen ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">OneDrive Submission Link</label>
              <input
                type="url"
                required
                value={onedriveLink}
                onChange={(e) => setOnedriveLink(e.target.value)}
                placeholder="https://onedrive.live.com/..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Post Assignment
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No assignments created yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
                    
                    <div className="mt-4 flex space-x-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-blue-600">
                        <LinkIcon className="w-4 h-4 mr-1.5" />
                        <a href={assignment.onedriveLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Submission Link
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {assignment.submissions?.length || 0} Submissions
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageAssignments;
