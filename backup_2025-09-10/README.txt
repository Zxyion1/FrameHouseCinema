FrameHouseCinema Backup - 2025-09-10
=================================================
This folder marks a snapshot point AFTER animations + booking flow refinements.

Source files to include in this backup (copy from project root at time of creation):
- index.html
- booking.html
- book-now.html
- videos.html
- videos_new.html (if still used)
- scenery.html
- people.html
- lighting.html
- architecture.html
- events.html
- section.html (if present)
- style.css
- /images (entire directory)
- /Media (if still referenced by any legacy paths)
- /js (all booking/time/service/navigation related scripts)

Git Suggested Tag / Branch:
  git checkout main
  git add .
  git commit -m "Backup: snapshot 2025-09-10 after animations + booking refinements"
  git branch backup-2025-09-10
  git push origin backup-2025-09-10
  git tag -a backup-2025-09-10 -m "Snapshot 2025-09-10" && git push origin backup-2025-09-10 --tags

Quick PowerShell Helper (optional):
--------------------------------------------------
# Create a zip of this snapshot (run at project root)
Compress-Archive -Path index.html,booking.html,book-now.html,videos.html,scenery.html,people.html,lighting.html,architecture.html,events.html,style.css,images,Media,js -DestinationPath FrameHouseCinema_SNAPSHOT_2025-09-10.zip -Force

Restore Instructions:
1. Checkout backup branch OR extract the zip.
2. Overwrite working directory with extracted contents (if zip route).
3. Run: git add . && git commit -m "Restore from 2025-09-10 snapshot" && git push origin main

Notes:
- IntersectionObserver animation utilities present in all portfolio & booking pages.
- Booking flow includes separated Date & Time selection with duration + price.
- Time slot UI revised (smaller, two-row horizontal design with confirm button logic).
- Make sure any future service additions also update time-selection logic & pricing calc.

End of backup manifest.
