document.addEventListener('DOMContentLoaded', function() {
   const path = window.location.pathname;
   const match = path.match(/dashboard\/workspace\/(\d+)$/);
   const workspace_id = match ? match[1] : null;
document.querySelector('#downloadworkspace').addEventListener('click', function(event) {
   event.preventDefault();
   if (!workspace_id) {
       alert("Error in extraction, please reload the page.");
       return;
   }
   const table = document.getElementById('data_table');
   if (!table) {
       alert("No Data to download.");
       return;
   }
   const tbody = table.querySelector('tbody');
   if (!tbody) {
       alert("No Data to download.");
       return;
   }
   const rows = tbody.querySelectorAll('tr[objectid]');
   if (rows.length === 0) {
       alert("No Data to download.");
       return;
   }
   const payload = { 
         workspace_id: workspace_id
     };
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
        if (!response.ok) {
            hideLoading();
            return response.text().then(text => Promise.reject(text || 'Error'));
        }
        return response.json();
    })
   .then(data => {
     if (!data.task_id) {
         hideLoading();
         throw new Error('No task_id returned');
     }
     function pollStatus() {
         fetch(`/download-status/?task_id=${encodeURIComponent(data.task_id)}`)
         .then(res => res.json())
         .then(status => {
             if (status.ready && status.download_url) {
                 hideLoading();
                 const link = document.createElement('a');
                 link.href = status.download_url;
                 link.download = '';
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
             } else if (status.state === 'FAILURE') {
                 hideLoading();
                 alert('File generation failed');
             } else {
                 setTimeout(pollStatus, 2000);
             }
         }).catch(err => {
             hideLoading();
             alert('Error fetching download status');
             console.error(err);
         });
       }
      pollStatus();
    })
    .catch(err => {
        hideLoading();
        alert('Download failed: ' + err);
        console.error(err);
    });
  });
});
