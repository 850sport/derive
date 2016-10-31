var jquery = require('jquery'),
    leaflet = require('leaflet'),
    picoModal = require('picoModal');

var map = require('./map'),
    parseGPX = require('./gpx');


// Adapted from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(map, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var tracks = [];
    var files = evt.dataTransfer.files;
    var modal = buildUploadModal(files.length);

    modal.show();

    var fileIndex = 0;

    function loadNextFile() {
        if (fileIndex >= files.length) {
            tracks.forEach(t => map.addTrack(t));
            return modal.destroy();
        }

        var reader = new FileReader();
        reader.onload = (event) => {
            parseGPX(event.target.result, (err, track) => {
                // TODO: Make an error modal
                if (err) return window.alert(err);

                tracks.push(track);
                modal.progress(fileIndex);

                // do the next file, but give the UI time to update.
                window.setTimeout(loadNextFile, 1);
            });
        };

        reader.readAsBinaryString(files[fileIndex++]);
    }

    loadNextFile();
}


function handleDragOver(evt) {
    evt.dataTransfer.dropEffect = 'copy';
    evt.stopPropagation();
    evt.preventDefault();
}


function buildUploadModal(numFiles) {
    function getModalContent(numLoaded) {
        return `<h1>Reading GPX files...</h1>
<span id="">${numLoaded} loaded of <b>${numFiles}</b>`;
    }

    var modal = picoModal({
        content: getModalContent(0),
        closeButton: false,
        escCloses: false,
        overlayClose: false,
        overlayStyles: (styles) => { styles.opacity = 0.1; }
    });

    modal.progress = (loaded) => {
        modal.modalElem().innerHTML = getModalContent(loaded);
    };

    return modal;
}


function showHelpModal() {
    var modalContent = `
<h1>dérive.</h1>

<p>
In a dérive one or more persons during a certain period drop their
relations, their work and leisure activities, and all their other
usual motives for movement and action, and let themselves be drawn by
the attractions of the terrain and the encounters they find there.

<a href="http://library.nothingness.org/articles/SI/en/display/314"><sup>1</sup></a>
</p>

<h4>Help:</h4>
<p>There is no help.</p>
`;

    var modal = picoModal({
        content: modalContent,
        overlayStyles: (styles) => { styles.opacity = 0.01; }
    });

    modal.show();

    return modal;
}


function initialize(map) {
    modal = showHelpModal();

    window.addEventListener('dragover', handleDragOver, false);

    window.addEventListener('drop', e => {
        modal.destroy();
        handleFileSelect(map, e);
    }, false);
}


module.exports = {
    initialize: initialize
};
