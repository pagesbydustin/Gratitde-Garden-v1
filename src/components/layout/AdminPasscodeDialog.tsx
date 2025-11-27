
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type AdminPasscodeDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

// In a real app, this should be a secure check against a backend or environment variable
const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'admin123';

export function AdminPasscodeDialog({ isOpen, onClose, onSuccess }: AdminPasscodeDialogProps) {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (passcode === ADMIN_PASSCODE) {
            setError('');
            setPasscode('');
            toast({ title: 'Success', description: 'Admin access granted.' });
            onSuccess();
        } else {
            setError('Invalid passcode. Please try again.');
        }
    };

    const handleClose = () => {
        setError('');
        setPasscode('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Admin Access Required</DialogTitle>
                    <DialogDescription>
                        Please enter the passcode to switch to the Admin profile.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="passcode" className="text-right">
                            Passcode
                        </Label>
                        <Input
                            id="passcode"
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive col-span-4 text-center">{error}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit}>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
