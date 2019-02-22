import PropTypes from 'prop-types';
import createConnector from '../core/createConnector';
import {
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getIndexId,
} from '../core/indexUtils';

function getId() {
  return 'query';
}

function getCurrentRefinement(props, searchState, context) {
  const id = getId(props);
  return getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    '',
    currentRefinement => {
      if (currentRefinement) {
        return currentRefinement;
      }
      return '';
    }
  );
}

function refine(props, searchState, nextRefinement, context) {
  const id = getId();
  const nextValue = { [id]: nextRefinement };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, getId());
}

/**
 * connectSearchBox connector provides the logic to build a widget that will
 * let the user search for a query
 * @name connectSearchBox
 * @kind connector
 * @propType {string} [defaultRefinement] - Provide a default value for the query
 * @providedPropType {function} refine - a function to change the current query
 * @providedPropType {string} currentRefinement - the current query used
 * @providedPropType {boolean} isSearchStalled - a flag that indicates if InstantSearch has detected that searches are stalled
 */
export default createConnector({
  displayName: 'AlgoliaSearchBox',

  propTypes: {
    defaultRefinement: PropTypes.string,
  },

  getProvidedProps(props, searchState, searchResults) {
    return {
      currentRefinement: getCurrentRefinement(props, searchState, {
        ais: props.contextValue,
      }),
      isSearchStalled: searchResults.isSearchStalled,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, {
      ais: props.contextValue,
    });
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, { ais: props.contextValue });
  },

  getSearchParameters(searchParameters, props, searchState, context) {
    return searchParameters.setQuery(
      getCurrentRefinement(props, searchState, context)
    );
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinement(props, searchState, {
      ais: props.contextValue,
    });
    return {
      id,
      index: getIndexId({ ais: props.contextValue }),
      items:
        currentRefinement === null
          ? []
          : [
              {
                label: `${id}: ${currentRefinement}`,
                value: nextState =>
                  refine(props, nextState, '', { ais: props.contextValue }),
                currentRefinement,
              },
            ],
    };
  },
});
