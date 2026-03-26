"use client";

import { useState, useRef, useEffect } from "react";
import { updateProfile } from "@/actions/profile";
import type { Profile } from "@/lib/types/database";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Camera, Upload } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function ProfileEditDialog({ profile }: { profile: Profile }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showWebcam, setShowWebcam] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Adjuntar el stream al video cuando se renderice


    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setMediaStream(stream);
            setShowWebcam(true);
        } catch (err) {
            console.error("No se pudo acceder a la cámara:", err);
            setError("No se pudo acceder a la cámara. Por favor, verifica los permisos de tu navegador.");
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowWebcam(false);
    };

    useEffect(() => {
        if (showWebcam && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [showWebcam, mediaStream]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(blob));
                        stopCamera();
                    }
                }, "image/jpeg", 0.9);
            }
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) stopCamera();
        setOpen(isOpen);
    };

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);

    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        weight_kg: profile.weight_kg?.toString() || "",
        height_cm: profile.height_cm?.toString() || "",
        avatar_url: profile.avatar_url || "",
    });

    const supabase = createClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let finalAvatarUrl = formData.avatar_url;

        // Si hay una foto nueva, súbela a Supabase Storage
        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile);

            if (uploadError) {
                setError(`Error al subir imagen: ${uploadError.message}`);
                setLoading(false);
                return;
            }

            // Obtener la URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            finalAvatarUrl = publicUrl;
        }

        const res = await updateProfile({ ...formData, avatar_url: finalAvatarUrl });

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-indigo-600/30 text-indigo-600 hover:text-blue-600 hover:border-indigo-600/50 hover:bg-indigo-600/10">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar Perfil</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Actualiza tu información personal y foto de perfil.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {showWebcam ? (
                        <div className="flex flex-col items-center gap-4 mb-6 w-full">
                            <div className="relative w-full max-w-[240px] aspect-square bg-black rounded-full overflow-hidden shadow-inner border-4 border-indigo-600/30">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="flex gap-2 w-full justify-center">
                                <Button type="button" variant="outline" onClick={stopCamera}>
                                    Cancelar
                                </Button>
                                <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={capturePhoto}>
                                    📸 Capturar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-600/20 bg-muted flex items-center justify-center shrink-0">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-muted-foreground/50">
                                        {formData.full_name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-3 w-full">
                                <Label className="cursor-pointer flex-1 max-w-[140px] bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> Galería
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </Label>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={startCamera}
                                    className="flex-1 max-w-[140px] bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-indigo-200 flex items-center justify-center gap-2 h-9"
                                >
                                    <Camera className="w-4 h-4" /> Cámara
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Ej. Luis Pérez"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight_kg">Peso (kg)</Label>
                            <Input
                                id="weight_kg"
                                type="number"
                                step="0.1"
                                value={formData.weight_kg}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                                placeholder="Ej. 75.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height_cm">Altura (cm)</Label>
                            <Input
                                id="height_cm"
                                type="number"
                                step="any"
                                value={formData.height_cm}
                                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                                placeholder="Ej. 180"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={loading} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
