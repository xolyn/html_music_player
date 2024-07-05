document.addEventListener('DOMContentLoaded', function () {
    const audio = document.getElementById('audio');
    const lyricsContainer = document.getElementById('lyrics');
    
    //load lrc
    fetch('hh.lrc')
        .then(response => response.text())
        .then(data => {
            const lyrics = parseLyrics(data);
            displayLyrics(lyrics);
            syncLyrics(lyrics, audio);
        });

    function parseLyrics(data) {
        const lines = data.split('\n');
        const lyrics = lines.map(line => {
            const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (match) {
                return {
                    time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
                    text: match[3]
                };
            }
        }).filter(line => line);
        return lyrics;
    }

    function displayLyrics(lyrics) {
        lyricsContainer.innerHTML = '';
        lyrics.forEach(line => {
            const p = document.createElement('p');
            p.dataset.time = line.time;
            p.textContent = line.text;
            lyricsContainer.appendChild(p);
        });
    }

    function syncLyrics(lyrics, audio) {
        audio.addEventListener('timeupdate', function () {
            const currentTime = audio.currentTime;
            let activeLine = null;

            for (let i = 0; i < lyrics.length; i++) {
                if (currentTime >= lyrics[i].time && (!lyrics[i + 1] || currentTime < lyrics[i + 1].time)) {
                    activeLine = lyrics[i];
                    break;
                }
            }

            if (activeLine) {
                const lines = lyricsContainer.querySelectorAll('p');
                lines.forEach(line => {
                    if (parseFloat(line.dataset.time) === activeLine.time) {
                        line.classList.add('active');
                        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        line.classList.remove('active');
                    }
                });
            }
        });
    }
});

