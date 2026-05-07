<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            direction: rtl;
        }

        .wrapper {
            max-width: 600px;
            margin: 40px auto;
        }

        .card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
        }

        .header {
            background: linear-gradient(135deg, #0d9488, #0f766e);
            padding: 40px 40px 32px;
            text-align: center;
        }

        .logo {
            font-size: 26px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
        }

        .logo span {
            opacity: 0.75;
            font-weight: 400;
        }

        .body {
            padding: 40px;
        }

        .greeting {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
        }

        .text {
            font-size: 15px;
            line-height: 1.7;
            color: #475569;
            margin-bottom: 20px;
        }

        .trial-box {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
            text-align: center;
        }

        .trial-box .days {
            font-size: 36px;
            font-weight: 800;
            color: #0d9488;
        }

        .trial-box .label {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
        }

        .trial-box .date {
            font-size: 13px;
            color: #475569;
            margin-top: 8px;
            font-family: monospace;
        }

        .btn {
            display: inline-block;
            background: #0d9488;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            text-align: center;
            margin: 8px 0 24px;
        }

        .steps {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
        }

        .steps h4 {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }

        .step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 10px;
        }

        .step-num {
            width: 24px;
            height: 24px;
            background: #0d9488;
            color: white;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .step-text {
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
            padding-top: 3px;
        }

        .footer {
            text-align: center;
            padding: 24px 40px;
            border-top: 1px solid #f1f5f9;
        }

        .footer p {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.6;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="card">

            <!-- Header -->
            <div class="header">
                <div class="logo">🏥 AyadatyPro</div>
            </div>

            <!-- Body -->
            <div class="body">
                <h1 class="greeting">مرحباً، {{ $userName }} 👋</h1>

                <p class="text">
                    شكراً لانضمامك إلى <strong>AyadatyPro</strong>. تم إنشاء حساب عيادتك
                    <strong>{{ $clinicName }}</strong> بنجاح وهو جاهز للاستخدام الآن.
                </p>

                <!-- Trial box -->
                <div class="trial-box">
                    <div class="days">14</div>
                    <div class="label">يوماً تجريبياً مجاناً</div>
                    @if ($trialEndsAt)
                        <div class="date">تنتهي الفترة التجريبية: {{ $trialEndsAt }}</div>
                    @endif
                </div>

                <div style="text-align: center;">
                    <a href="{{ $dashboardUrl }}" class="btn">
                        ابدأ الآن →
                    </a>
                </div>

                <!-- Getting started steps -->
                <div class="steps">
                    <h4>ابدأ في 3 خطوات</h4>
                    <div class="step">
                        <div class="step-num">1</div>
                        <div class="step-text">أكمل إعداد عيادتك — اسم العيادة، التخصص، أوقات العمل</div>
                    </div>
                    <div class="step">
                        <div class="step-num">2</div>
                        <div class="step-text">أضف أطباءك وموظفي الاستقبال من إعدادات الفريق</div>
                    </div>
                    <div class="step">
                        <div class="step-num">3</div>
                        <div class="step-text">ابدأ بإضافة المرضى وحجز المواعيد</div>
                    </div>
                </div>

                <p class="text" style="margin-top: 24px; font-size: 13px;">
                    إذا واجهت أي مشكلة أو احتجت مساعدة، راسلنا على
                    <a href="mailto:support@ayadatypro.com" style="color: #0d9488;">support@ayadatypro.com</a>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>
                    AyadatyPro — نظام إدارة العيادات الطبية<br />
                    هذه الرسالة أُرسلت إليك لأنك سجّلت حساباً جديداً.<br />
                    إذا لم تكن أنت من فعل ذلك، يرجى تجاهل هذه الرسالة.
                </p>
            </div>

        </div>
    </div>
</body>

</html>
