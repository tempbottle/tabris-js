var MARGIN = 12;

var trayHeight;
var trayState = 'down';
var dragOffset;

var loremIpsum = 'Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In ' +
                 'vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam ' +
                 'sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus ' +
                 'placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum.\n\n' +
                 'Pellentesque euismod varius purus nec pharetra. Sed vitae ipsum sit amet ' +
                 'risus vehicula euismod in at nunc. Sed in viverra arcu, id blandit risus. ' +
                 'Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat ' +
                 'consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. ' +
                 'Integer vel ante sapien.\n\nNunc sit amet blandit tellus, sed consequat ' +
                 'neque. Proin vel elementum augue. Quisque gravida nulla nisl, at fermentum ' +
                 'turpis euismod in. ';

var page = new tabris.Page({
  title: 'Tray',
  autoDispose: false
});

new tabris.TextView({
  left: MARGIN, right: MARGIN, top: MARGIN,
  text: loremIpsum,
  textColor: '#777'
}).appendTo(page);

var shade = new tabris.Composite({
  left: 0, right: 0, top: 0, bottom: 0,
  background: 'black',
  opacity: 0
}).appendTo(page);

var tray = new tabris.Composite({
  left: 0, right: 0, top: '30%', bottom: 0
}).appendTo(page);

var strap = new tabris.Composite({
  left: '40%', right: '40%', top: 0, height: 65,
  background: '#259b24'
}).appendTo(tray);

var strapIcon = new tabris.TextView({
  left: MARGIN, right: MARGIN, top: 20,
  alignment: 'center',
  text: '⇧',
  font: 'bold 24px',
  textColor: 'white'
}).appendTo(strap);

var trayContent = new tabris.Composite({
  left: MARGIN, right: MARGIN, top: [strap, 0], bottom: 0,
  background: '#8bc34a'
}).appendTo(tray);

new tabris.TextView({
  left: MARGIN, right: MARGIN, top: MARGIN,
  alignment: 'center',
  text: 'Tray content',
  font: 'bold 24px',
  textColor: 'white'
}).appendTo(trayContent);

trayContent.on('resize', function() {
  var bounds = trayContent.bounds;
  trayHeight = bounds.height;
  if (trayState === 'dragging') {
    positionTrayInRestingState(2000);
  } else {
    tray.transform = {translationY: trayHeight};
  }
});

strap.on('pan:vertical', function(widget, event) {
  if (event.state === 'start' && (trayState === 'up' || trayState === 'down')) {
    trayState = 'dragging';
    dragOffset = tray.transform.translationY - event.translation.y;
  }
  if (trayState === 'dragging') {
    var offsetY = Math.min(Math.max(event.translation.y + dragOffset, 0), trayHeight);
    tray.transform = {translationY: offsetY};
    shade.opacity = getShadeOpacity(offsetY);
    strapIcon.transform = getStrapIconTransform(offsetY);
  }
  if (event.state === 'end' && trayState === 'dragging') {
    positionTrayInRestingState(event.velocity.y);
  }
});

strap.on('tap', function() {
  if (trayState === 'up' || trayState === 'down') {
    positionTrayInRestingState(trayState === 'down' ? -1000 : 1000);
  }
});

module.exports = page;

function positionTrayInRestingState(velocity) {
  trayState = 'animating';
  var translationY = velocity > 0 ? trayHeight : 0;
  var options = {
    duration: Math.min(Math.abs(trayHeight / velocity * 1000), 800),
    easing: Math.abs(velocity) >= 1000 ? 'ease-out' : 'ease-in-out'
  };
  shade.animate({opacity: getShadeOpacity(translationY)}, options);
  strapIcon.animate({transform: getStrapIconTransform(translationY)}, options);
  tray
    .animate({transform: {translationY: translationY}}, options)
    .then(function() {
      trayState = velocity > 0 ? 'down' : 'up';
    });
}

function getShadeOpacity(translationY) {
  var traveled = translationY / trayHeight;
  return Math.max(0, 0.75 - traveled);
}

function getStrapIconTransform(translationY) {
  var traveled = translationY / trayHeight;
  return {rotation: traveled * Math.PI - Math.PI};
}
