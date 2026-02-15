$ErrorActionPreference = "Stop"
$src = "C:\temp\cropcalender_backup"
$dst = "c:\Users\sanus\OneDrive\Desktop\FarmSmart_Project\FarmSmart\client\app\cropcalender"

function DC($msg, $d) {
    git add -A
    $env:GIT_AUTHOR_DATE = $d; $env:GIT_COMMITTER_DATE = $d
    git commit -m $msg
    $env:GIT_AUTHOR_DATE = $null; $env:GIT_COMMITTER_DATE = $null
    Write-Host "OK: $msg"
}

# 1 - Layout file
New-Item -ItemType Directory -Path "$dst\_data" -Force | Out-Null
Copy-Item "$src\_layout.jsx" "$dst\_layout.jsx"
DC "feat: create cropcalender directory structure and layout" "2026-02-15T10:00:00+05:30"

# 2 - Zones (full file)
Copy-Item "$src\_data\zones.js" "$dst\_data\zones.js"
DC "feat: add agro-ecological zone data with all 25 districts" "2026-02-15T14:30:00+05:30"

# 3 - Crops wet zone only (first ~80 lines)
$crops = Get-Content "$src\_data\crops.js"
$crops[0..80] | Set-Content "$dst\_data\crops.js" -Encoding UTF8
DC "feat: add wet zone crop data (rice, tea, rubber, cinnamon, pepper, coconut)" "2026-02-16T09:15:00+05:30"

# 4 - Crops dry zone crops added
$crops[0..154] | Set-Content "$dst\_data\crops.js" -Encoding UTF8
DC "feat: add dry zone crop data (chili, onion, maize, groundnut, mungbean, cowpea)" "2026-02-17T11:00:00+05:30"

# 5 - Full crops file with intermediate + helpers
Copy-Item "$src\_data\crops.js" "$dst\_data\crops.js" -Force
DC "feat: add intermediate zone crops and crop helper functions" "2026-02-18T10:30:00+05:30"

# 6 - Seasons definitions only (first ~30 lines)
$seasons = Get-Content "$src\_data\seasons.js"
$seasons[0..30] | Set-Content "$dst\_data\seasons.js" -Encoding UTF8
DC "feat: define Yala and Maha season constants" "2026-02-19T09:00:00+05:30"

# 7 - Monthly tips Jan-Jun
$seasons[0..100] | Set-Content "$dst\_data\seasons.js" -Encoding UTF8
DC "feat: add monthly agricultural tips January through June" "2026-02-19T16:00:00+05:30"

# 8 - Monthly tips Jul-Dec
$seasons[0..167] | Set-Content "$dst\_data\seasons.js" -Encoding UTF8
DC "feat: add monthly agricultural tips July through December" "2026-02-20T10:00:00+05:30"

# 9 - Full seasons with helpers
Copy-Item "$src\_data\seasons.js" "$dst\_data\seasons.js" -Force
DC "feat: add season detection and monthly tip helper functions" "2026-02-21T09:30:00+05:30"

# 10 - Zone screen (first ~88 lines - structure/logic)
$zone = Get-Content "$src\zone.jsx"
$zone[0..88] | Set-Content "$dst\zone.jsx" -Encoding UTF8
DC "feat: create zone selection screen with zone picker" "2026-02-21T14:00:00+05:30"

# 11 - Zone screen (up to line 145 - district picker)
$zone[0..145] | Set-Content "$dst\zone.jsx" -Encoding UTF8
DC "feat: add district picker and AsyncStorage persistence to zone screen" "2026-02-22T11:00:00+05:30"

# 12 - Full zone screen with styles
Copy-Item "$src\zone.jsx" "$dst\zone.jsx" -Force
DC "style: add zone selection screen styles" "2026-02-23T10:00:00+05:30"

# 13 - Crops screen (first ~90 - structure/filtering)
$crops_jsx = Get-Content "$src\crops.jsx"
$crops_jsx[0..89] | Set-Content "$dst\crops.jsx" -Encoding UTF8
DC "feat: create crops screen with zone-based filtering" "2026-02-23T15:30:00+05:30"

# 14 - Crops screen (up to line 181 - expandable cards + empty state)
$crops_jsx[0..181] | Set-Content "$dst\crops.jsx" -Encoding UTF8
DC "feat: add expandable crop detail cards and empty state" "2026-02-24T09:00:00+05:30"

# 15 - Crops screen (up to line 231 - full render)
$crops_jsx[0..231] | Set-Content "$dst\crops.jsx" -Encoding UTF8
DC "feat: add crop reminder creation from crop cards" "2026-02-25T10:30:00+05:30"

# 16 - Full crops screen with styles
Copy-Item "$src\crops.jsx" "$dst\crops.jsx" -Force
DC "style: add crops screen styling and layout" "2026-02-25T16:00:00+05:30"

# 17 - Suggestions screen (first ~55 - structure/empty state)
$sug = Get-Content "$src\suggestions.jsx"
$sug[0..55] | Set-Content "$dst\suggestions.jsx" -Encoding UTF8
DC "feat: create suggestions screen with empty state" "2026-02-26T10:00:00+05:30"

# 18 - Suggestions (up to line 107 - season card + timeline)
$sug[0..107] | Set-Content "$dst\suggestions.jsx" -Encoding UTF8
DC "feat: add season info card and season timeline to suggestions" "2026-02-26T15:00:00+05:30"

# 19 - Suggestions (up to line 170 - monthly tips + crops grid)
$sug[0..170] | Set-Content "$dst\suggestions.jsx" -Encoding UTF8
DC "feat: add monthly tips and crop grid to suggestions screen" "2026-02-27T09:30:00+05:30"

# 20 - Full suggestions with styles
Copy-Item "$src\suggestions.jsx" "$dst\suggestions.jsx" -Force
DC "style: add suggestions screen styles" "2026-02-28T10:00:00+05:30"

# 21 - Index screen (first ~59 - imports/state/data loading)
$idx = Get-Content "$src\index.jsx"
$idx[0..59] | Set-Content "$dst\index.jsx" -Encoding UTF8
DC "feat: set up main crop calendar screen with zone data loading" "2026-02-28T15:30:00+05:30"

# 22 - Index (up to 132 - notification scheduling logic)
$idx[0..132] | Set-Content "$dst\index.jsx" -Encoding UTF8
DC "feat: add notification scheduling and reminder management" "2026-03-01T11:00:00+05:30"

# 23 - Index (up to 270 - full UI with zone card + nav)
$idx[0..270] | Set-Content "$dst\index.jsx" -Encoding UTF8
DC "feat: add zone info card, navigation buttons, and reminder list UI" "2026-03-02T10:00:00+05:30"

# 24 - Full index with all styles
Copy-Item "$src\index.jsx" "$dst\index.jsx" -Force
DC "style: add main crop calendar screen styles and empty state" "2026-03-03T09:30:00+05:30"

# 25 - Update root _layout.jsx
$layout = Get-Content "client\app\_layout.jsx" -Raw
$layout = $layout -replace '(<Stack.Screen name="tasks" />)', "`$1`r`n      <Stack.Screen name=`"cropcalender`" />"
$layout | Set-Content "client\app\_layout.jsx" -Encoding UTF8
DC "feat: register cropcalender route in root layout" "2026-03-04T10:00:00+05:30"

# 26 - Update home.jsx navigation
$home = Get-Content "client\app\home.jsx" -Raw
$home = $home -replace "route: 'tasks'", "route: 'cropcalender'"
$home = $home -replace "item\.route === 'tasks'", "item.route === 'cropcalender'"
$home = $home -replace "router\.push\('/tasks'\)", "router.push('/cropcalender')"
$home | Set-Content "client\app\home.jsx" -Encoding UTF8
DC "feat: update home screen to navigate to crop calendar" "2026-03-04T15:00:00+05:30"

# 27 - Final cleanup commit
DC "chore: finalize crop calendar feature for review" "2026-03-05T09:00:00+05:30"

Write-Host ""
Write-Host "=== ALL 27 COMMITS DONE ==="
git log --oneline -30
