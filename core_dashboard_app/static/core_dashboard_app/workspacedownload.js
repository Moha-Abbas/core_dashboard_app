document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#downloadnworkspace').addEventListener('click', function(event) {
        event.preventDefault();
        alert('Download started!');
        const table = document.getElementById('data_table');
        if (!table) {
            alert("Table with id 'data_table' not found.");
            return;
        }
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            alert("Table body missing.");
            return;
        }
        const rows = tbody.querySelectorAll('tr[objectid]');
        if (rows.length === 0) {
            alert("Empty: No rows to download.");
            return;
        }
        const objectIds = Array.from(rows).map(tr => tr.getAttribute('objectid'));
        const payload = { object_ids: objectIds };
        showLoading();
        fetch('/download-from-workspace/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            hideLoading();
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Network response was not ok');
                });
            }
            return response.blob().then(blob => {
                const disposition = response.headers.get('Content-Disposition');
                let filename = 'downloaded_file';
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    filename = disposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
                }

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            });
        })
        .catch(error => {
            hideLoading();
            alert("Download failed: " + error.message);
        });
    });
});
