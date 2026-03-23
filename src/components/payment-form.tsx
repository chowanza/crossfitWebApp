"use client";

import { useState } from "react";
import { registerPayment } from "@/actions/payments";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, ChevronDown, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Profile } from "@/lib/types/database";

interface PaymentFormProps {
    athletes: Pick<Profile, "id" | "full_name">[];
    trigger: React.ReactNode;
    defaultUserId?: string;
}

export function PaymentForm({ athletes, trigger, defaultUserId }: PaymentFormProps) {
    const [open, setOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string>(defaultUserId || "");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const filteredAthletes = athletes.filter((a) =>
        (a.full_name || "Sin nombre").toLowerCase().includes(searchQuery.toLowerCase())
    );
    const selectedAthlete = athletes.find((a) => a.id === selectedId);

    // Defaults: período del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await registerPayment(formData);
        if (result?.error) {
            setError(result.error);
            toast.error("Error al registrar el pago");
            setLoading(false);
        } else {
            toast.success("Pago registrado exitosamente");
            setOpen(false);
            setLoading(false);
            setSearchQuery("");
            setSelectedId(defaultUserId || "");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                    <DialogDescription>
                        Registra el pago de mensualidad de un atleta.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2 relative">
                        <Label>Atleta</Label>
                        <input type="hidden" name="user_id" value={selectedId} required />
                        
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className={selectedAthlete ? "text-foreground font-medium" : "text-muted-foreground"}>
                                    {selectedAthlete ? selectedAthlete.full_name : "Buscar atleta..."}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>

                            {dropdownOpen && (
                                <>
                                    {/* Invisible Overlay to close on outside click */}
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setDropdownOpen(false)} 
                                    />
                                    <div className="absolute top-full text-foreground left-0 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-lg z-50">
                                        <div className="flex items-center border-b px-3">
                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="flex h-11 w-full flex-1 rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Escribe para buscar..."
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-52 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                                            {filteredAthletes.length === 0 ? (
                                                <p className="p-4 text-center text-sm text-muted-foreground">
                                                    No se encontraron atletas.
                                                </p>
                                            ) : (
                                                filteredAthletes.map((a) => (
                                                    <div
                                                        key={a.id}
                                                        onClick={() => {
                                                            setSelectedId(a.id);
                                                            setDropdownOpen(false);
                                                            setSearchQuery("");
                                                        }}
                                                        className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${selectedId === a.id ? "bg-indigo-500/10 text-indigo-500 font-medium" : ""}`}
                                                    >
                                                        <Check
                                                            className={`mr-2 h-4 w-4 ${selectedId === a.id ? "opacity-100" : "opacity-0"}`}
                                                        />
                                                        {a.full_name || "Sin nombre"}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Monto</Label>
                        <Input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ej: 30.00"
                            required
                            className="bg-muted/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Período Inicio</Label>
                            <Input
                                name="period_start"
                                type="date"
                                defaultValue={firstDay}
                                required
                                className="bg-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Período Fin</Label>
                            <Input
                                name="period_end"
                                type="date"
                                defaultValue={lastDay}
                                required
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    <input type="hidden" name="status" value="PAID" />

                    <div className="space-y-2">
                        <Label>Notas (opcional)</Label>
                        <Textarea
                            name="notes"
                            placeholder="Método de pago, referencia, etc."
                            rows={2}
                            className="bg-muted/50 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                            {loading ? "Registrando..." : "Registrar Pago"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
