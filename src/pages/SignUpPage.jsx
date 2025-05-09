
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Film } from 'lucide-react';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const { signUp } = useAuth(); // Corrigido de signup para signUp
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    //setIsLoading(true);
    setNeedsConfirmation(false);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      toast({ title: "Erro no Cadastro", description: "As senhas não coincidem.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
       setError('A senha deve ter pelo menos 6 caracteres.');
       toast({ title: "Erro no Cadastro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
       setIsLoading(false);
       return;
    }

    const result = signUp(email, password, { name, username }); // Corrigido de signup para signUp
    setIsLoading(false);

    if (result.success) {
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
        toast({ 
          title: "Cadastro quase completo!", 
          description: "Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada (e spam).",
          duration: 10000 
        });
      } else {
        toast({ title: "Cadastro realizado com sucesso!", description: `Bem-vindo, ${name || username}!` });
        navigate('/'); 
      }
    } else {
      setError(result.message || 'Ocorreu um erro desconhecido.');
      toast({ title: "Erro no Cadastro", description: result.message || 'Tente novamente.', variant: "destructive" });
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                 <Film className="h-8 w-8 text-primary" />
                 <CardTitle className="text-3xl">Cineza</CardTitle>
              </div>
              <CardDescription>Confirme seu E-mail</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Enviamos um link de confirmação para o seu e-mail: <strong>{email}</strong>.</p>
              <p>Por favor, verifique sua caixa de entrada (e a pasta de spam) e clique no link para ativar sua conta.</p>
              <p>Após confirmar, você poderá <Link to="/login" className="text-primary hover:underline">fazer login</Link>.</p>
            </CardContent>
             <CardFooter className="flex flex-col items-center text-sm">
                <p>Não recebeu o e-mail?</p>
                <Button variant="link" onClick={async () => {
                  toast({ title: "Reenviando e-mail...", description: "Aguarde um momento."});
                  // Adicionar lógica de reenviar email se necessário.
                  // Por enquanto, apenas um placeholder.
                  // Idealmente, você teria uma função no AuthContext para isso.
                  // Ex: await resendConfirmationEmail(email);
                  // Por agora, vamos simular um reenvio.
                  setTimeout(() => {
                     toast({ title: "E-mail de confirmação reenviado!", description: "Verifique sua caixa de entrada."});
                  }, 2000);
                }} className="px-0">
                  Reenviar e-mail de confirmação
                </Button>
             </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-2 mb-4">
               <Film className="h-8 w-8 text-primary" />
               <CardTitle className="text-3xl">Cineza</CardTitle>
             </div>
            <CardDescription>Crie sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu_usuario (min. 3 caracteres, sem espaços)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  required
                  minLength={3}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm">
             <p>Já tem uma conta?</p>
             <Button variant="link" asChild className="px-0" disabled={isLoading}>
               <Link to="/login">Faça login</Link>
             </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
