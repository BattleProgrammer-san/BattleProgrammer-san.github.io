var checkboxes = document.querySelectorAll('input[type="checkbox"]');
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', function() {
        for (var j = 0; j < checkboxes.length; j++) {
            if (checkboxes[j] !== this) {
                checkboxes[j].checked = false;
            }
        }
    });
}

var navItems = document.querySelectorAll('.nav-item');
for (var i = 0; i < navItems.length; i++) {
    navItems[i].addEventListener('mouseover', function() {
        var preview = document.querySelector('.preview-' + this.id);
        preview.classList.add('active');
    });
    navItems[i].addEventListener('mouseout', function() {
        var preview = document.querySelector('.preview-' + this.id);
        preview.classList.remove('active');
    });
}