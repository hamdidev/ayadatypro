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
            max-width: 560px;
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

        .creds {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 10px;
            padding: 16px 20px;
            margin: 20px 0;
        }

        .creds table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .creds td {
            padding: 4px 0;
        }

        .creds .label {
            color: #64748b;
            width: 120px;
        }

        .creds .value {
            font-weight: bold;
            color: #0c4a6e;
            direction: ltr;
            text-align: left;
        }

        .btn {
            display: block;
            text-align: center;
            background: #1e40af;
            color: #fff;
            padding: 14px 24px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
            margin: 24px 0;
        }

        .warning {
            font-size: 12px;
            color: #ef4444;
            background: #fff7ed;
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
                <p>دعوة للانضمام إلى فريق العيادة</p>
            </div>
            <div class="body">
                <p>مرحباً {{ $user->name }}،</p>
                <p>تمت إضافتك كعضو في فريق <strong>{{ $clinicName }}</strong>. يمكنك الدخول إلى النظام باستخدام
                    البيانات التالية:</p>

                <div class="creds">
                    <table>
                        <tr>
                            <td class="label">البريد الإلكتروني</td>
                            <td class="value">{{ $user->email }}</td>
                        </tr>
                        <tr>
                            <td class="label">كلمة المرور</td>
                            <td class="value">{{ $temporaryPassword }}</td>
                        </tr>
                    </table>
                </div>

                <a href="{{ url('/login') }}" class="btn">تسجيل الدخول الآن</a>

                <p class="warning">
                    ⚠️ هذه كلمة مرور مؤقتة. يُرجى تغييرها فور تسجيل الدخول من إعدادات الحساب.
                </p>
            </div>
        </div>
        <div class="footer">
            هذه الرسالة أُرسلت تلقائياً من نظام AyadatyPro. إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذه الرسالة.
        </div>
    </div>
</body>

</html>
