$toolsDir = "d:\DoAnTotNgiep\tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

$mavenHome = Join-Path $toolsDir "apache-maven-3.9.6"
$zipPath = Join-Path $toolsDir "maven.zip"

if (!(Test-Path $mavenHome)) {
    Write-Host "Dang tai Apache Maven..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $zipPath
    Write-Host "Dang giai nen Maven..."
    Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
    Remove-Item $zipPath -Force
}

$mvnCmd = Join-Path $mavenHome "bin\mvn.cmd"
& $mvnCmd -version
