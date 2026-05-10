<?php

namespace App\Services;

use Vonage\Client;
use Vonage\Client\Credentials\Basic;
use Vonage\SMS\Message\SMS;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client(
            new Basic(
                config('services.vonage.key'),
                config('services.vonage.secret'),
            )
        );
    }

    public function send(string $to, string $message): bool
    {
        // Normalize Gulf numbers: ensure E.164 format
        $to = $this->normalizePhone($to);

        try {
            $response = $this->client->sms()->send(
                new SMS($to, config('services.vonage.sms_from'), $message)
            );

            $first = $response->current();

            if ($first->getStatus() !== 0) {
                Log::warning('Vonage SMS failed', [
                    'to'     => $to,
                    'status' => $first->getStatus(),
                    'error'  => $first->getErrorText(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Vonage SMS exception', [
                'to'    => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    private function normalizePhone(string $phone): string
    {
        // Strip spaces, dashes, parentheses
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);

        // Already E.164
        if (str_starts_with($phone, '+')) {
            return ltrim($phone, '+');
        }

        // Local Saudi: 05xxxxxxxx → 9665xxxxxxxx
        if (preg_match('/^05\d{8}$/', $phone)) {
            return '966' . substr($phone, 1);
        }

        // Local UAE: 05xxxxxxxx → 9715xxxxxxxx
        // Add more Gulf country rules as needed

        return $phone;
    }
}
