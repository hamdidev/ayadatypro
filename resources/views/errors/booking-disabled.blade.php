<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>الحجز غير متاح</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #f8fafc;
            direction: rtl;
        }

        .card {
            background: white;
            border-radius: 16px;
            padding: 48px 40px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
        }

        h1 {
            font-size: 20px;
            color: #0f172a;
            margin-bottom: 8px;
        }

        p {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
        }
    </style>
</head>

<body>
    <div class="card">
        <div style="font-size:48px;margin-bottom:16px;">🏥</div>
        <h1>{{ $clinic->name }}</h1>
        <p>الحجز الإلكتروني غير متاح حالياً لهذه العيادة.<br>يرجى التواصل معها مباشرة لحجز موعد.</p>
    </div>
</body>

</html>
