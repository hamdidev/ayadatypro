<?php

namespace App\Mail;

use App\Models\Patient;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PatientMagicLink extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Patient $patient,
        public readonly string  $magicUrl,
        public readonly string  $clinicName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "رابط الدخول — {$this->clinicName}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.patient-magic-link');
    }
}
