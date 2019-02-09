(function( document, $ ) {
	function init_ajax_search() {
		$('.cmb-ajax-search:not([data-ajax-search="true"])').each(function () {
			$(this).attr('data-ajax-search', true);

			var input_id 	= $(this).attr('id'); // Field id with '_input' sufix (the searchable field)
			var field_id 	= $(this).attr('id').replace( new RegExp('_input$'), '' ); // Field id, the true one field
			var object_type = $(this).attr('data-object-type');
			var query_args 	= $(this).attr('data-query-args');

			$(this).devbridgeAutocomplete(Object.assign({
				serviceUrl: cmb_ajax_search.ajaxurl,
				type: 'POST',
				triggerSelectOnValidInput: false,
				showNoSuggestionNotice: true,
				params: {
					action  	: 'cmb_ajax_search_get_results',
					nonce		: cmb_ajax_search.nonce, // nonce
					field_id	: field_id,		// Field id for hook purposes
					object_type	: object_type, 	// post, user or term
					query_args	: query_args, 	// Query args passed to field
				},
				transformResult: function( results ) {
					var suggestions = $.parseJSON( results );

					if( $('#' + field_id + '_results li').length ) {
						var selected_vals 	= [];
						var d 				= 0;

						$('#' + field_id + '_results input').each(function( index, element ) {
							selected_vals.push( $(this).val() );
						});

						// Remove already picked suggestions
						$(suggestions).each(function( index, suggestion ) {
							if( $.inArray( ( suggestion.id ).toString(), selected_vals ) > -1 ) {
								suggestions.splice( index - d, 1 );
								d++;
							}
						});
					}

					return { suggestions: suggestions };
				},
				onSearchStart: function(){
					$(this).next('img.cmb-ajax-search-spinner').css( 'display', 'inline-block' );
				},
				onSearchComplete: function(){
					$(this).next('img.cmb-ajax-search-spinner').hide();
				},
				onSelect: function ( suggestion ) {
					$(this).devbridgeAutocomplete('clearCache');

					var field_name  = $(this).attr('id').replace( new RegExp('_input$'), '' );
					var multiple 	= $(this).attr('data-multiple');
					var limit 	    = parseInt( $(this).attr('data-limit') );
					var sortable    = $(this).attr('data-sortable');

					if( multiple == 1 ) {
						// Multiple
						$('#' + field_name + '_results' ).append( '<li>' +
							( ( sortable == 1 ) ? '<span class="hndl"></span>' : '' ) +
							'<input type="hidden" name="' + field_name + '[]" value="' + suggestion.id + '">' +
							'<a href="' + suggestion.link + '" target="_blank" class="edit-link">' + suggestion.value + '</a>' +
							'<a class="remover"><span class="dashicons dashicons-no"></span><span class="dashicons dashicons-dismiss"></span></a>' +
							'</li>' );

						$(this).val( '' );

						// Checks if there is the max allowed results, limit < 0 means unlimited
						if( limit > 0 && limit == $('#' + field_name + '_results li').length ) {
							$(this).prop( 'disabled', 'disabled' );
						} else {
							$(this).focus();
						}
					} else {
						// Singular
						$('input[name=' + field_name + ']').val( suggestion.id ).change();
					}
				}
			},
			cmb_ajax_search.options));

			if( $(this).attr('data-sortable') == 1 ){
				$('#' + field_id + '_results').sortable({
					handle				 : '.hndl',
					placeholder			 : 'ui-state-highlight',
					forcePlaceholderSize : true
				});
			}
		});
	}

	// Initialize ajax search
	init_ajax_search();

	// Initialize on group fields add row
	$( document ).on( 'cmb2_add_row', function( evt, $row ) {
		$row.find('.cmb-ajax-search').attr('data-ajax-search', false);

		init_ajax_search();
	});

	// Initialize on widgets area
	$(document).on('widget-updated widget-added', function() {
		init_ajax_search();
	});

	// On click remover listener
	$('body').on( 'click', '.cmb-ajax-search-results a.remover', function() {
		$(this).parent('li').fadeOut( 400, function(){ 
			var field_id = $(this).parents('ul').attr('id').replace('_results', '');

			$('#' + field_id).removeProp( 'disabled' );
			$('#' + field_id).devbridgeAutocomplete('clearCache');

            $(this).remove();
        });
	});
})(document, jQuery);
