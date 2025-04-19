import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';

import { useOnClickOutside } from 'hooks';
import { ReactComponent as SearchIcon } from 'svg/search.svg';

import css from './searchable-select.module.scss';

const cx = classNames.bind(css);

const SearchableSelect = (props) => {
  const {
    className, label, options, onChange, value, placeholder, width, loading, ...rest
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  // Filter options based on search term
  const filteredOptions = options.filter((option) => (
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Handle option selection
  const handleOptionSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Find the selected option label
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Handle input change for search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className={classNames(cx('searchable-select'), className)}>
      {label && (
        <span className={cx('label')}>{label}</span>
      )}
      <div className={cx('select-container')} ref={dropdownRef} style={{ width }}>
        <div
          className={cx('select-input', { 'is-open': isOpen })}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={cx('select-value', { placeholder: !displayValue })}>
            {displayValue || placeholder}
          </span>
          <i className={cx('select-arrow', { 'is-open': isOpen })} />
        </div>

        {isOpen && (
          <div className={cx('dropdown')}>
            <div className={cx('search-container')}>
              <SearchIcon className={cx('search-icon')} />
              <input
                type="text"
                className={cx('search-input')}
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
            <div className={cx('options-container')}>
              {loading ? (
                <div className={cx('loading')}>Loading...</div>
              ) : filteredOptions.length > 0 ? (
                <ul className={cx('options-list')}>
                  {filteredOptions.map((option) => (
                    <li
                      key={option.value}
                      className={cx('option', { selected: option.value === value })}
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={cx('no-results')}>No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SearchableSelect.propTypes = {
  className: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  value: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool,
};

SearchableSelect.defaultProps = {
  className: '',
  label: null,
  value: '',
  placeholder: 'Select an option',
  width: 200,
  loading: false,
};

export default SearchableSelect;
