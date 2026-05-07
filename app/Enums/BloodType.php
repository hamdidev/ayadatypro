<?php

namespace App\Enums;

enum BloodType: string
{
    case APos = 'A+';
    case ANeg = 'A-';
    case BPos = 'B+';
    case BNeg = 'B-';
    case ABPos = 'AB+';
    case ABNeg = 'AB-';
    case OPos = 'O+';
    case ONeg = 'O-';

    public function label(): string
    {
        return $this->value; // Display value is the same as stored value
    }
}
