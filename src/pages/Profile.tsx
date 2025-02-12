import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { ArrowLeft, User, Loader, MessageCircle, Heart, Upload } from 'lucide-react';
import ProfileImage from '../components/ProfileImage';

export default function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [about, setAbout] = useState(currentUser.about || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function handleUpdateProfile() {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        about
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please upload only JPG or PNG images');
      return;
    }

    try {
      setUploadingImage(true);
      const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL
      });
      
      await updateProfile({ photoURL });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleLogout() {
    try {
      setLogoutLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate('/chat')}
            className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={loading || logoutLoading}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <ProfileImage
                src={currentUser.photoURL}
                alt={currentUser.username}
                size="lg"
                className="border-4 border-white shadow-lg"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full shadow-lg 
                  hover:bg-blue-600 transition-colors group-hover:scale-110 transform duration-200"
              >
                {uploadingImage ? (
                  <Loader className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800">{currentUser.username}</h2>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    disabled={loading}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700">{about || 'No about information added yet.'}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={logoutLoading || loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
            >
              {logoutLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Log Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}