Get-Content "$PSScriptRoot\..\.env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $idx = $line.IndexOf('=')
        if ($idx -gt 0) {
            $k = $line.Substring(0, $idx).Trim()
            $v = $line.Substring($idx + 1).Trim()
            [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
        }
    }
}
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
& "$env:JAVA_HOME\bin\java.exe" -jar "$PSScriptRoot\..\backend\target\store-backend-0.0.1-SNAPSHOT.jar"
