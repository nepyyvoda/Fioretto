(function($){
  $(function(){

    $('.button-collapse').sideNav(
	/*{closeOnClick: true}*/);


  }); // end of document ready
})(jQuery); // end of jQuery name space


$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      /*hover: true,*/ // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false // Displays dropdown below the button
    }
  );
     

window.onload=function() {
    if(document.getElementById("ifr")) {
        document.getElementById("ifr").style.height=window.innerHeight+"px";
    }
}

$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15 // Creates a dropdown of 15 years to control year
});

$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
});

$(document).ready(function() {
    $('select').material_select();
});

