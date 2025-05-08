
import React from 'react';
import { Save, UserCircle, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatarFallback } from '@/lib/utils';

const EditProfileForm = ({
  name,
  setName,
  bio,
  setBio,
  avatarPreview,
  currentUser,
  isLoading,
  handleSubmit,
  onSelectFile
}) => {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <UserCircle className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold">Editar Perfil</CardTitle>
        </div>
        <CardDescription>Atualize suas informações pessoais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-32 w-32 border-4 border-primary/30 shadow-md">
              <AvatarImage src={avatarPreview || currentUser?.avatar_url} alt={name || currentUser?.name} />
              <AvatarFallback className="text-4xl">{generateAvatarFallback(name || currentUser?.name || currentUser?.username)}</AvatarFallback>
            </Avatar>
            <Button asChild variant="outline" size="sm">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <ImageIcon className="h-4 w-4 mr-2" />
                Mudar Avatar
              </Label>
            </Button>
            <Input id="avatar-upload" type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Nome de Exibição</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome como será exibido"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={160}
              disabled={isLoading}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
          </div>
          <CardFooter className="px-0 pt-4">
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              <Save className="h-5 w-5 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
