/**
 * FINAL POST CREATION FIX
 * Simplified, reliable implementation for post creation
 */

(function() {
  console.log('⚡ POST FIX FINAL: Initializing...');

  document.addEventListener('DOMContentLoaded', initialize);

  function initialize() {
    const form = document.getElementById('create-post-form');
    const modal = document.getElementById('create-post-modal');
    const scheduleToggle = document.getElementById('schedule-toggle');
    const scheduleInputs = document.getElementById('schedule-inputs');
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');

    if (!form || !modal) {
      console.error('⚡ POST FIX FINAL: Required elements not found');
      return;
    }

    // Handle scheduling toggle
    scheduleToggle.addEventListener('change', () => {
      scheduleInputs.style.display = scheduleToggle.checked ? 'block' : 'none';
    });

    // Handle image preview
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
      }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = document.getElementById('post-content').value.trim();
      const hasImage = imageInput.files.length > 0;
      const isScheduled = scheduleToggle.checked;
      const scheduleDate = document.getElementById('schedule-date').value;
      const scheduleTime = document.getElementById('schedule-time').value;

      if (!content && !hasImage) {
        alert('Please add some text or an image to your post.');
        return;
      }

      let scheduledDateTime = null;
      if (isScheduled) {
        if (!scheduleDate || !scheduleTime) {
          alert('Please select both date and time for scheduling.');
          return;
        }
        scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledDateTime <= new Date()) {
          alert('Scheduled time must be in the future.');
          return;
        }
      }

      const post = {
        id: Date.now(),
        content,
        image: hasImage ? imageInput.files[0] : null,
        scheduledDateTime: scheduledDateTime ? scheduledDateTime.toISOString() : null,
      };

      savePost(post);
      resetForm();
      modal.style.display = 'none';
      alert('Post created successfully!');
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Close modal on close button click
    modal.querySelector('.close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    posts.unshift(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    console.log('⚡ POST FIX FINAL: Post saved', post);
  }

  function resetForm() {
    const form = document.getElementById('create-post-form');
    form.reset();
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('schedule-inputs').style.display = 'none';
  }
})();
