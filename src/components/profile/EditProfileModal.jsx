
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { updateUserProfile as updateProfileService, uploadAvatar as uploadAvatarService } from '@/lib/services/userService';
import { Camera, Crop as CropIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImageBlob } from '@/lib/imageUtils';

const MAX_BIO_LENGTH = 160;
const MAX_AVATAR_SIZE_MB = 5;
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

const AvatarUpload = ({ currentAvatarUrl, onFileSelect, isSubmitting, username, name }) => {
  const fileInputRef = useRef(null);
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative group">
        <Avatar className="h-28 w-28 border-2 border-primary/20">
          <AvatarImage src={currentAvatarUrl} alt="Avatar Preview" />
          <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
            {name ? name.charAt(0).toUpperCase() : (username ? username.charAt(0).toUpperCase() : 'U')}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute bottom-1 right-1 rounded-full h-9 w-9 bg-card/80 hover:bg-card group-hover:opacity-100 opacity-80 transition-opacity shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting}
        >
          <Camera className="h-4 w-4 text-primary" />
          <span className="sr-only">Alterar foto de perfil</span>
        </Button>
      </div>
      <Input
        id="avatarFile"
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_AVATAR_TYPES.join(',')}
        onChange={onFileSelect}
        disabled={isSubmitting}
      />
      <p className="text-xs text-muted-foreground">Clique para alterar</p>
    </div>
  );
};

const ProfileForm = ({ name, setName, bio, setBio, isSubmitting }) => (
  <>
    <div className="space-y-1">
      <Label htmlFor="name" className="text-muted-foreground">Nome de Exibição</Label>
      <Input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-background border-border text-foreground focus:ring-primary/50"
        placeholder="Seu nome"
        maxLength={50}
        disabled={isSubmitting}
      />
    </div>
    <div className="space-y-1">
      <Label htmlFor="bio" className="text-muted-foreground">Bio</Label>
      <Textarea
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Fale um pouco sobre você..."
        rows={3}
        className="bg-background border-border text-foreground focus:ring-primary/50 resize-none"
        maxLength={MAX_BIO_LENGTH}
        disabled={isSubmitting}
      />
      <p className={`text-xs text-right ${bio.length > MAX_BIO_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
        {bio.length} / {MAX_BIO_LENGTH}
      </p>
    </div>
  </>
);

const ImageCropperView = ({ imgSrc, crop, setCrop, aspect, onImageLoad, onConfirm, onCancel, isSubmitting }) => {
  const imgRef = useRef(null);
  return (
    <div className="space-y-4 p-1">
      <p className="text-sm text-muted-foreground text-center">Ajuste a área de corte da sua nova foto.</p>
      <div className="flex justify-center max-h-[60vh] overflow-hidden rounded-md border border-border">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          aspect={aspect}
          minWidth={100}
          minHeight={100}
          className="max-w-full"
        >
          <img
            ref={imgRef}
            alt="Crop preview"
            src={imgSrc}
            onLoad={(e) => {
              imgRef.current = e.currentTarget;
              onImageLoad(e);
            }}
            style={{ display: 'block', maxHeight: '55vh', objectFit: 'contain' }}
          />
        </ReactCrop>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button onClick={() => onConfirm(imgRef.current)} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CropIcon className="mr-2 h-4 w-4" />}
          Confirmar Corte
        </Button>
      </div>
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, userProfile, onProfileUpdate }) => {
  const { refreshUserProfile: refreshAuthContextUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(''); 
  
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [imgSrcToCrop, setImgSrcToCrop] = useState('');
  const [crop, setCrop] = useState();
  const [showCropper, setShowCropper] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aspect = 1 / 1;

  const resetFormState = useCallback(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
      const avatar = userProfile.avatar_url || `https://avatar.vercel.sh/${userProfile.username}.png?text=${userProfile.username?.charAt(0).toUpperCase()}`;
      setCurrentAvatarUrl(avatar);
      setPreviewAvatar(avatar);
    }
    setNewAvatarFile(null);
    setShowCropper(false);
    setImgSrcToCrop('');
    setCrop(undefined);
  }, [userProfile]);

  useEffect(() => {
    if (isOpen) {
      resetFormState();
    }
  }, [userProfile, isOpen, resetFormState]);

  const centerAspectCrop = (mediaWidth, mediaHeight, aspectR) => {
    return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspectR, mediaWidth, mediaHeight), mediaWidth, mediaHeight);
  };

  const onImageLoadForCropper = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const handleAvatarFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        toast({ title: "Tipo de Arquivo Inválido", description: "Selecione PNG, JPG ou GIF.", variant: "destructive" });
        return;
      }
      if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
        toast({ title: "Arquivo Muito Grande", description: `Tamanho máximo: ${MAX_AVATAR_SIZE_MB}MB.`, variant: "destructive" });
        return;
      }
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrcToCrop(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset file input
    }
  };

  const handleCropConfirm = async (imageElement) => {
    if (!imageElement || !crop?.width || !crop?.height) {
      toast({ title: "Erro ao Cortar", description: "Selecione uma área para cortar.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const croppedBlob = await getCroppedImageBlob(imageElement, crop, 'avatar.png');
      setNewAvatarFile(croppedBlob);
      setPreviewAvatar(URL.createObjectURL(croppedBlob)); 
      setShowCropper(false);
      setImgSrcToCrop('');
    } catch (error) {
      toast({ title: "Erro ao Cortar", description: "Não foi possível processar a imagem.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImgSrcToCrop('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showCropper) {
      toast({ title: "Ação Pendente", description: "Confirme ou cancele o corte da imagem.", variant: "default" });
      return;
    }
    if (bio.length > MAX_BIO_LENGTH) {
      toast({ title: "Bio Muito Longa", description: `Máximo de ${MAX_BIO_LENGTH} caracteres.`, variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = userProfile?.avatar_url; 
      if (newAvatarFile && userProfile?.id) {
        finalAvatarUrl = await uploadAvatarService(userProfile.id, newAvatarFile);
      }
      const updatedData = {
        name: name.trim() || null, 
        bio: bio.trim() || null,
        avatar_url: finalAvatarUrl,
      };

      if (!userProfile?.id) throw new Error("ID do perfil do usuário ausente.");
      
      const updatedProfile = await updateProfileService(userProfile.id, updatedData);
      onProfileUpdate(updatedProfile); 
      await refreshAuthContextUser();
      toast({ title: "Perfil Atualizado", description: "Suas informações foram salvas." });
      onClose();
    } catch (error) {
      toast({ title: "Erro ao Atualizar", description: error.message || "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Perfil</DialogTitle>
        </DialogHeader>

        {showCropper && imgSrcToCrop ? (
          <ImageCropperView
            imgSrc={imgSrcToCrop}
            crop={crop}
            setCrop={setCrop}
            aspect={aspect}
            onImageLoad={onImageLoadForCropper}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
            isSubmitting={isSubmitting}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <AvatarUpload
              currentAvatarUrl={previewAvatar || currentAvatarUrl}
              onFileSelect={handleAvatarFileSelect}
              isSubmitting={isSubmitting}
              username={userProfile?.username}
              name={name}
            />
            <ProfileForm
              name={name}
              setName={setName}
              bio={bio}
              setBio={setBio}
              isSubmitting={isSubmitting}
            />
            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || showCropper}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
