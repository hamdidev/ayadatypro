<?php

namespace App\Mail;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeClinicMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly Clinic $clinic,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'مرحباً بك في AyadatyPro — '.$this->clinic->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-clinic',
            with: [
                'userName' => $this->user->name,
                'clinicName' => $this->clinic->name,
                'trialEndsAt' => $this->clinic->trial_ends_at?->format('Y-m-d'),
                'dashboardUrl' => route('dashboard'),
            ],
        );
    }
}
