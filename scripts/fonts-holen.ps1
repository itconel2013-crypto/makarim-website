# Laedt die Google-Schriften einmalig herunter und legt sie im Projekt ab, damit die
# Website sie selbst ausliefert und beim Besuch nichts mehr an Google geht.
#
# Bewusst NICHT der uebliche next/font-Weg: Der vergibt den Schriften generierte Namen.
# In diesem Projekt setzen Dutzende Komponenten die Schrift namentlich
# (fontFamily: "'Newsreader', serif"); die wuerden alle auf Systemschriften zurueckfallen.
# Mit eigenen @font-face-Regeln bleibt der Name derselbe, am Rest des Codes aendert sich nichts.
#
# Geladen werden Variable Fonts (eine Datei deckt alle Schriftstaerken ab) und nur die
# Zeichensaetze latin und latin-ext - mehr braucht Deutsch nicht.
param([string]$ZielOrdner, [string]$ZielCss)

$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

$schriften = @(
  @{ name = 'Newsreader';        datei = 'newsreader';        url = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,8..72,400..600;1,8..72,400..600&display=swap' },
  @{ name = 'Schibsted Grotesk'; datei = 'schibsted-grotesk'; url = 'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400..700&display=swap' },
  @{ name = 'JetBrains Mono';    datei = 'jetbrains-mono';    url = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400..600&display=swap' }
)
$erlaubt = @('latin', 'latin-ext')

New-Item -ItemType Directory -Force -Path $ZielOrdner | Out-Null
$regeln = @()
$anz = 0

foreach ($s in $schriften) {
  $css = (Invoke-WebRequest $s.url -UseBasicParsing -Headers @{ 'User-Agent' = $ua } -TimeoutSec 60).Content
  $treffer = [regex]::Matches($css, '/\*\s*([a-z0-9-]+)\s*\*/\s*(@font-face\s*\{[\s\S]*?\})')
  foreach ($t in $treffer) {
    $subset = $t.Groups[1].Value
    $block = $t.Groups[2].Value
    if ($erlaubt -notcontains $subset) { continue }

    $style  = [regex]::Match($block, 'font-style:\s*([a-z]+)').Groups[1].Value
    if (-not $style) { $style = 'normal' }
    $weight = [regex]::Match($block, 'font-weight:\s*([^;]+)').Groups[1].Value.Trim()
    $range  = [regex]::Match($block, 'unicode-range:\s*([^;]+)').Groups[1].Value.Trim()
    $url    = [regex]::Match($block, 'url\(([^)]+)\)').Groups[1].Value
    if (-not $url) { continue }

    $kursiv = ''
    if ($style -eq 'italic') { $kursiv = '-italic' }
    $dateiname = "$($s.datei)-$subset$kursiv.woff2"
    $pfad = Join-Path $ZielOrdner $dateiname
    Invoke-WebRequest $url -UseBasicParsing -Headers @{ 'User-Agent' = $ua } -TimeoutSec 60 -OutFile $pfad
    $anz++
    "  $dateiname  $([math]::Round((Get-Item $pfad).Length/1KB,1)) KB  ($subset, $style, $weight)"

    $r = "/* $($s.name) - $subset"
    if ($style -eq 'italic') { $r += ', kursiv' }
    $r += " */`n@font-face {`n  font-family: '$($s.name)';`n  font-style: $style;`n  font-weight: $weight;`n  font-display: swap;`n  src: url('/fonts/$dateiname') format('woff2');`n"
    if ($range) { $r += "  unicode-range: $range;`n" }
    $r += '}'
    $regeln += $r
  }
}

[System.IO.File]::WriteAllText($ZielCss, (($regeln -join "`n`n") + "`n"), (New-Object System.Text.UTF8Encoding($false)))
""
"$anz Dateien geladen, Regeln in $ZielCss"
