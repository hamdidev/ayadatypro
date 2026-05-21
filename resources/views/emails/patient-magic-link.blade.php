<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            direction: rtl;
        }

        .wrapper {
            max-width: 520px;
            margin: 40px auto;
        }

        .card {
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }

        .header {
            background: #1e40af;
            padding: 28px 32px;
        }

        .header h1 {
            color: #fff;
            margin: 0;
            font-size: 20px;
            font-weight: bold;
        }

        .header p {
            color: #bfdbfe;
            margin: 4px 0 0;
            font-size: 13px;
        }

        .body {
            padding: 32px;
        }

        .body p {
            font-size: 14px;
            line-height: 1.7;
            color: #374151;
            margin: 0 0 16px;
        }

        .btn {
            display: block;
            text-align: center;
            background: #1e40af;
            color: #fff !important;
            padding: 14px 24px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: bold;
            font-size: 15px;
            margin: 24px 0;
        }

        .warning {
            font-size: 12px;
            color: #64748b;
            background: #f8fafc;
            border-radius: 8px;
            padding: 10px 14px;
        }

        .footer {
            text-align: center;
            padding: 16px;
            font-size: 11px;
            color: #94a3b8;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <h1>{{ $clinicName }}</h1>
                <p>بوابة المريض</p>
            </div>
            <div class="body">
                <p>مرحباً {{ $patient->name }}،</p>
                <p>
                    طلبت الدخول إلى بوابة المريض. انقر على الزر أدناه للدخول مباشرة —
                    لا حاجة لكلمة مرور.
                </p>

                <a href="{{ $magicUrl }}" class="btn">دخول البوابة</a>

                <p class="warning">
                    ⏱ هذا الرابط صالح لمدة 15 دقيقة فقط ولمرة واحدة.<br>
                    إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان.
                </p>
            </div>
        </div>
        <div class="footer">
            مدعوم بـ AyadatyPro
        </div>
    </div>
</body>

</html>
