import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserPlus } from 'lucide-react';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      
      setAllStudents(res.data.filter(s => s.id !== user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    
    try {
      await axios.post('http://localhost:5000/api/groups', {
        name: groupName,
        memberIds: selectedMembers
      });
      setGroupName('');
      setSelectedMembers([]);
      fetchGroups();
    } catch (err) {
      alert('Failed to create group');
    }
  };

  const toggleMember = (studentId) => {
    setSelectedMembers(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading) return <div>Loading...</div>;

  const hasGroup = groups.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Group</h2>
      </div>

      {!hasGroup ? (
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Create a New Group
          </h3>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., Team Alpha"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                {allStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No other students available to invite.</p>
                ) : (
                  allStudents.map(student => (
                    <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(student.id)}
                        onChange={() => toggleMember(student.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        <span className="text-xs text-gray-500">{student.email}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Group
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  {group.name}
                </h3>
                <span className="text-sm text-gray-500">Created: {new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Members</h4>
                <ul className="space-y-3">
                  {group.members.map(member => (
                    <li key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3">
                          {member.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.user.name} {member.user.id === user.id && '(You)'}
                          </p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
