'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './donorentries.module.css';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: string[] | DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name: string;
  id: string;
  required?: boolean;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  name,
  id,
  required = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const formattedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      // Use setTimeout to ensure the event listener is added after the click event
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`${styles.dropdownTrigger} ${isOpen ? styles.open : ''} ${
          !value ? styles.placeholder : ''
        }`}
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <span className={styles.triggerText}>{displayValue}</span>
        <ChevronDown
          className={`${styles.triggerIcon} ${isOpen ? styles.iconOpen : ''}`}
          size={20}
        />
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={styles.dropdownMenu}
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {formattedOptions.map((option) => (
            <div
              key={option.value}
              className={`${styles.dropdownItem} ${
                value === option.value ? styles.selected : ''
              }`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
              {value === option.value && <span className={styles.checkmark}>✓</span>}
            </div>
          ))}
        </div>
      )}

      <input
        type="hidden"
        name={name}
        id={id}
        value={value}
        required={required}
      />
    </>
  );
}
