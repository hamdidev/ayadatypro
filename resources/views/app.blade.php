<!DOCTYPE html>
<html lang="ar" dir="rtl" class="h-full">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="عيادتي — نظام إدارة العيادات الطبية" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    {{-- Preconnect for Arabic fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    {{-- @routes --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>

<body class="h-full bg-gray-50 antialiased">
    @inertia
</body>

</html>
