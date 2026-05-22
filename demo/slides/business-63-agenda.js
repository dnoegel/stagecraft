'use strict';

Stage.register(Stage.Agenda({
  section: 63,
  title: '63 · Today',
  items: [
    { time: '09:00', label: 'Welcome & coffee',        duration: '30 min', icon: 'coffee' },
    { time: '09:30', label: 'Keynote: state of the art', duration: '45 min', icon: 'campaign' },
    { time: '10:15', label: 'Workshop: Stagecraft',    duration: '90 min', icon: 'design_services' },
    { time: '11:45', label: 'Lunch',                   duration: '60 min', icon: 'restaurant' },
    { time: '12:45', label: 'Lightning talks',         duration: '60 min', icon: 'bolt' },
    { time: '13:45', label: 'Wrap-up',                 duration: '15 min', icon: 'flag' }
  ],
  reveal: 'staggered'
}));
