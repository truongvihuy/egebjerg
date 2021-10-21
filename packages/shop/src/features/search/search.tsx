import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { initializeApollo } from 'utils/apollo';
import { GET_SUGGESTION } from 'graphql/query/product.query';
import {
  StyledClearButton,
  StyledForm,
  StyledInput,
  StyledSearchButton,
} from './search.style';
import { SearchIcon } from 'assets/icons/SearchIcon';
import { SuggestionBox } from './suggestion-box';
import { parseUrlParams, pushQueryToUrlParams } from 'utils/parse-url-params';
import { DELAY_TIME_REQUEST_SEARCH } from 'config/constant';

interface Props {
  minimal?: boolean;
  showButtonText?: boolean;
  onSubmit?: () => void;
  [key: string]: unknown;
  idPlaceHolder?: string;
  includeSuggestion?: boolean;
  isGlobal?: boolean;
  productIdList?: [number];
  searchInputId: string;
}

const Search: React.FC<Props> = ({
  onSubmit,
  idPlaceHolder,
  minimal,
  isGlobal = false,
  className,
  shadow,
  showButtonText,
  buttonText,
  productIdList,
  includeSuggestion = false,
  searchInputId,
  ...props
}) => {
  const [searchState, setSearchState] = useState({
    text: '',
    focus: false,
    suggestions: [],
    selectedRow: null,
    timeoutId: null,
  });
  const router = useRouter();
  const { pathname, asPath } = router;
  const { query } = parseUrlParams(asPath);
  const searchStateRef = useRef(searchState);

  const q = !isGlobal
    || (isGlobal && (pathname === '/' || pathname === '/category/[slug]')) // Search on header and/or then choose category/filter
    ? (query.q ?? '')
    : '';
  const intl = useIntl();

  useEffect(() => {
    setSearchState({
      ...searchState,
      text: q ?? '',
    });
  }, [q, pathname]);

  useEffect(() => {
    searchStateRef.current = searchState;
  }, [searchState]);

  useEffect(() => {
    if (searchState.focus) {
      window.addEventListener('click', onBlur);
    } else {
      window.removeEventListener('click', onBlur);
    }
    return () => {
      if (searchState.focus)
        window.removeEventListener('click', onBlur);
    }
  }, [searchState.focus]);

  const onBlur = (e) => {
    if (e.target.id !== searchInputId) {
      setSearchState({
        ...searchStateRef.current,
        focus: false,
        suggestions: [],
      });
    }
  };

  const handleOnChange = (e) => {
    const { value } = e.target;
    let newSearchState = {
      ...searchState,
      selectedRow: null,
      focus: true,
      text: value,
    };
    if (newSearchState.timeoutId) {
      clearTimeout(newSearchState.timeoutId);
      newSearchState.timeoutId = null;
    }

    if (value.length > 1 && includeSuggestion) {
      const apolloClient = initializeApollo();
      let variable: any = {};
      variable.keyword = value;

      newSearchState.timeoutId = setTimeout(() => {
        apolloClient.query({
          query: GET_SUGGESTION,
          variables: variable,
        }).then(response => {
          setSearchState({
            ...searchState,
            text: value,
            suggestions: response.data.suggestProduct,
            focus: true,
            selectedRow: null,
            timeoutId: null,
          });
        })
      }, DELAY_TIME_REQUEST_SEARCH);
    }

    setSearchState(newSearchState);
  };

  const onEnter = (e) => {
    e.preventDefault();
    let suggestion = searchState.selectedRow !== null ? searchState.suggestions[searchState.selectedRow] : { text: searchState.text };
    onSearch(suggestion);
  };

  const clearText = () => {
    setSearchState({
      ...searchState,
      text: '',
      suggestions: [],
      selectedRow: null,
    });
  }
  const scrollToSelectedSuggestion = (index) => {
    if (0 <= index && index < searchState.suggestions.length) {
      const suggestionBox = document.getElementById('suggestion-list');
      const selectedElement: any = suggestionBox.childNodes[index];
      const elHeight = selectedElement.clientHeight;
      let elOffset = 0;
      for (let i = 0; i < index; i++) {
        let element: any = suggestionBox.childNodes[i];
        elOffset += element.clientHeight;
      }

      const scrollTop = suggestionBox.scrollTop;
      const viewport = scrollTop + suggestionBox.clientHeight;

      if (elOffset < scrollTop) {
        suggestionBox.scrollTop = elOffset;
      }
      if (viewport < (elOffset + elHeight)) {
        suggestionBox.scrollTop = (elOffset + elHeight) - suggestionBox.clientHeight;
      }
    }
  }
  const onKeyUp = (e) => {
    if (searchState.focus && searchState.suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        let newSelectedRow = (searchState.selectedRow ?? -1) + 1;

        setSearchState({
          ...searchState,
          selectedRow: newSelectedRow < searchState.suggestions.length ? newSelectedRow : null,
        });
        scrollToSelectedSuggestion(newSelectedRow);
      }
      if (e.key === 'ArrowUp') {
        let newSelectedRow = (searchState.selectedRow ?? searchState.suggestions.length) - 1;
        setSearchState({
          ...searchState,
          selectedRow: newSelectedRow >= 0 ? newSelectedRow : null,
        });
        scrollToSelectedSuggestion(newSelectedRow);
      }
    }
  }

  const onFocus = () => {
    if (!searchState.focus) {
      setSearchState({
        ...searchState,
        focus: true,
      });
    }
  }

  const onSearch = (e: any) => {
    if (searchState.timeoutId) {
      clearTimeout(searchState.timeoutId);
    }
    if (e._id) {
      router.push('/product/[slug]', `/product/${e._id}-${e.slug}`);
      setSearchState({
        ...searchState,
        focus: false,
        suggestions: [],
        selectedRow: null,
        text: e.text,
        timeoutId: null,
      });
    } else {
      const q = e.text;
      let newValueRouter = {
        pathname: '',
        asUrl: '',
      }

      if (isGlobal) {
        newValueRouter = {
          pathname: '/',
          asUrl: `/?${pushQueryToUrlParams({ q, t: Date.now() })}`,
        }
      } else {
        newValueRouter = {
          pathname,
          asUrl: `${pathname}?${pushQueryToUrlParams({ q, t: Date.now() })}`,
        };
      }

      router.push(newValueRouter.pathname, newValueRouter.asUrl);

      setSearchState({
        ...searchState,
        focus: false,
        suggestions: [],
        selectedRow: null,
        text: q,
        timeoutId: null,
      });

      if (onSubmit) {
        onSubmit();
      }
    }
  }

  let value = searchState.selectedRow !== null ? searchState.suggestions[searchState.selectedRow].text : searchState.text;
  return (
    <StyledForm
      onSubmit={onEnter}
      boxShadow={shadow}
      className={className}
      minimal={minimal}
    >
      {minimal ? (
        <>
          <SearchIcon
            style={{ marginLeft: 16, marginRight: 16, color: '#212121' }}
          />
          <StyledInput
            type='search'
            id={searchInputId}
            onKeyUp={includeSuggestion ? onKeyUp : null}
            onFocus={onFocus}
            onChange={handleOnChange}
            value={value}
            placeholder={intl.formatMessage({
              id: !!idPlaceHolder ? idPlaceHolder : 'searchPlaceholder',
              defaultMessage: 'Search your products from here',
            })}
            {...props}
          />
          {searchState.text && <StyledClearButton type='button' onClick={clearText}>x</StyledClearButton>}
        </>
      ) : (
        <>
          <StyledInput
            type='search'
            id={searchInputId}
            onKeyUp={includeSuggestion ? onKeyUp : null}
            onFocus={onFocus}
            onChange={handleOnChange}
            value={value}
            placeholder={intl.formatMessage({
              id: !!idPlaceHolder ? idPlaceHolder : 'searchPlaceholder',
              defaultMessage: 'Search your products from here',
            })}
            {...props}
          />
          <StyledSearchButton>
            <SearchIcon style={{ marginRight: 10 }} />
            {showButtonText && buttonText}
          </StyledSearchButton>
        </>
      )}
      {includeSuggestion && <SuggestionBox isOpen={searchState.focus && searchState.suggestions.length > 0}
        selectedRow={searchState.selectedRow} suggestions={searchState.suggestions}
        onSelect={onSearch} />}
    </StyledForm>
  );
};

export default Search;
