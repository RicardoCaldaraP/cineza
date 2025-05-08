
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import AvatarCropperDialog from '@/components/profile/AvatarCropperDialog';
import EditProfileForm from '@/components/profile/EditProfileForm';

const BUCKET_NAME = 'user-avatars';

const EditProfilePage = () => {
  const { currentUser, updateUserProfileData, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [cropperImgSrc, setCropperImgSrc] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [originalFileForCropper, setOriginalFileForCropper] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatarPreview(currentUser.avatar_url || '');
      setInitialLoad(false);
    }
  }, [currentUser]);

  function handleSelectFileForCropper(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFileForCropper(file);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setCropperImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(file);
      setIsCropperOpen(true);
      e.target.value = ""; 
    }
  }

  const handleAvatarUpload = async (fileToUpload) => {
    if (!currentUser || !fileToUpload) return null;
    
    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false, 
      });
    
    if (uploadError) {
      toast({ title: "Erro no Upload do Avatar", description: uploadError.message, variant: "destructive" });
      return null;
    }
    
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleCropConfirm = async (newCroppedFile) => {
    setCroppedFile(newCroppedFile);
    setAvatarPreview(URL.createObjectURL(newCroppedFile));
    setIsCropperOpen(false);
    setCropperImgSrc('');
    setOriginalFileForCropper(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    
    let finalAvatarUrl = avatarPreview;

    if (croppedFile) {
      const uploadedUrl = await handleAvatarUpload(croppedFile);
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
      } else {
        setIsLoading(false);
        return; 
      }
    }

    const updates = {
      name: name,
      bio: bio,
      avatar_url: finalAvatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', currentUser.id);

    if (error) {
      toast({ title: "Erro ao atualizar perfil", description: error.message, variant: "destructive" });
    } else {
      if (updates.name !== currentUser.name || updates.avatar_url !== currentUser.avatar_url) {
        const { error: authUserUpdateError } = await supabase.auth.updateUser({
          data: { name: updates.name, avatar_url: updates.avatar_url }
        });
        if (authUserUpdateError) {
          console.error("Error updating auth user metadata:", authUserUpdateError);
        }
      }
      const updatedFullProfile = await fetchUserProfile(currentUser.id);
      if(updatedFullProfile) {
        updateUserProfileData({ ...currentUser, ...updatedFullProfile });
      } else {
        updateUserProfileData({ ...currentUser, ...updates });
      }
      
      toast({ title: "Perfil atualizado com sucesso!" });
      navigate(`/profile/${currentUser.username}`);
    }
    setIsLoading(false);
    setCroppedFile(null); 
  };

  if (initialLoad && !currentUser) {
     return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="shimmer h-16 w-16 rounded-full mx-auto mb-6"></div>
        <div className="shimmer h-8 w-3/4 rounded mx-auto mb-4"></div>
        <div className="shimmer h-20 w-full rounded mx-auto mb-6"></div>
        <div className="shimmer h-10 w-full rounded mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EditProfileForm
          name={name}
          setName={setName}
          bio={bio}
          setBio={setBio}
          avatarPreview={avatarPreview}
          currentUser={currentUser}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          onSelectFile={handleSelectFileForCropper}
        />
      </motion.div>

      <AvatarCropperDialog
        isOpen={isCropperOpen}
        onOpenChange={(isOpen) => { 
          if(!isOpen) { 
            setCropperImgSrc(''); 
            setOriginalFileForCropper(null); 
          } 
          setIsCropperOpen(isOpen);
        }}
        imgSrc={cropperImgSrc}
        onCropConfirm={handleCropConfirm}
        originalFileName={originalFileForCropper?.name}
      />
    </div>
  );
};

export default EditProfilePage;
