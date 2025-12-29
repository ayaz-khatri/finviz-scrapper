<?php

// this is the URL of the API hosted on Railway (Free Server)
$url = "https://finviz-scrapper-production-8450.up.railway.app/scrape";

$payload = json_encode([

    // change this URL to get your desired data
    "url" => "https://finviz.com/screener.ashx?v=111&f=fa_fpe_profitable%2Cfa_grossmargin_pos%2Cfa_netmargin_pos%2Cfa_opermargin_pos%2Cfa_pe_profitable%2Cfa_sales3years_pos%2Cfa_salesqoq_pos%2Csh_opt_option%2Cta_perf_13w10o%2Cta_perf2_52w20o&ft=4&o=price&auth=765ba876-9a57-4b6d-b943-6b3195753d78"
    
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ],
    CURLOPT_POSTFIELDS => $payload
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

echo "<pre>";
print_r($data);
echo "</pre>";

?>