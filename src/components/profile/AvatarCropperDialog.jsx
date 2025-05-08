
import React, { useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

async function getCroppedImg(image, cropData, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.floor(cropData.width * scaleX);
  canvas.height = Math.floor(cropData.height * scaleY);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }
  
  ctx.drawImage(
    image,
    cropData.x * scaleX,
    cropData.y * scaleY,
    cropData.width * scaleX,
    cropData.height * scaleY,
    0,
    0,
    cropData.width * scaleX,
    cropData.height * scaleY,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], fileName, { type: blob.type });
      resolve(file);
    }, 'image/png', 0.9);
  });
}


const AvatarCropperDialog = ({ 
  isOpen, 
  onOpenChange, 
  imgSrc, 
  onCropConfirm,
  originalFileName
}) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const aspect = 1 / 1;
  const { toast } = useToast();

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(newCrop);
    imgRef.current = e.currentTarget;
  }

  const handleConfirm = async () => {
    if (completedCrop && imgRef.current && originalFileName) {
      try {
        const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, originalFileName);
        onCropConfirm(croppedImageFile);
      } catch (error) {
        toast({ title: "Erro ao recortar", description: error.message, variant: "destructive" });
      }
    } else {
       toast({ title: "Erro ao recortar", description: "Por favor, selecione uma área para recortar ou verifique o arquivo original.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2"> <Crop className="w-5 h-5"/> Recortar Imagem</DialogTitle>
        </DialogHeader>
        <div className="p-4 max-h-[75vh] overflow-y-auto">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={100}
              minHeight={100}
              circularCrop={true}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh]"
              />
            </ReactCrop>
          )}
        </div>
        <DialogFooter className="p-4 pt-0 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!completedCrop}>
            <Check className="w-4 h-4 mr-2" /> Confirmar Recorte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropperDialog;
