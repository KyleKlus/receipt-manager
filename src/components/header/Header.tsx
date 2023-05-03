/** @format */

import styles from '@/styles/components/header/Header.module.css';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import ScrollUpButton from '../buttons/ScrollUpButton';
import SideNavigationButton from '../buttons/SideNavigationButton';
import HeaderNavigation from './HeaderNavigation';
import Logo from './Logo';
import SideNavigation from './SideNavigation';

interface IHeaderProps { sideNavChildren?: JSX.Element }

export default function Header(props: React.PropsWithChildren<IHeaderProps>) {
  const [isSideNavigationActive, setIsSideNavigationActive] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(true);
  const [isScrollArrowHidden, setIsScrollArrowHidden] = useState(true);
  const lastScroll = useRef(0);

  const isHeaderHiddenClassName = useRef('');

  const isActiveClassName = isSideNavigationActive
    ? styles.isWrapperActive
    : '';

  function hideAndShowHeader() {
    let slideInClass = ' ' + styles.slideIn
    let scrollDownClass = styles.isHidden

    if (isSideNavigationActive) { slideInClass = ''; scrollDownClass = styles.isVisible; }
    const currentScrollPos = window.pageYOffset;
    const lastScrollPos = lastScroll.current;
    lastScroll.current = currentScrollPos;

    if (currentScrollPos <= 64) {
      isHeaderHiddenClassName.current = '';

      setIsHeaderHidden(false);
      setIsScrollArrowHidden(true);
    } else if (currentScrollPos < lastScrollPos) {
      // up
      isHeaderHiddenClassName.current = styles.isVisible;

      setIsHeaderHidden(false);
    } else if (currentScrollPos > lastScrollPos) {
      // down
      isHeaderHiddenClassName.current = styles.isVisible;
      setIsHeaderHidden(true);
      setIsScrollArrowHidden(false);
    }
  }


  useEffect(() => {

    window.addEventListener('scroll', hideAndShowHeader);
    return () => {
      window.removeEventListener('scroll', hideAndShowHeader);
    };
  }, [isSideNavigationActive]);

  return (
    <div>
      <header className={styles.header + ' ' + isHeaderHiddenClassName.current}>
        <div className={styles.headerLeft}>
          <SideNavigationButton
            onClick={() => {
              setIsSideNavigationActive(!isSideNavigationActive);
              if (!isSideNavigationActive) {
                isHeaderHiddenClassName.current = isHeaderHiddenClassName.current;
                setIsHeaderHidden(false);
              } else {
                const currentScrollPos = window.pageYOffset;

                isHeaderHiddenClassName.current = currentScrollPos <= 64 ? '' : styles.isVisible
              }
            }}
          />
          <div
            className={
              styles.sideNavigationNegativeSpace + ' ' + isActiveClassName
            }
            onClick={() => {
              if (!isSideNavigationActive) {
                return;
              }
              setIsSideNavigationActive(false);
            }}
            onTouchStart={() => {
              if (!isSideNavigationActive) {
                return;
              }
              setIsSideNavigationActive(false);
            }}
          ></div>
          <Logo />
        </div>
        <HeaderNavigation>{props.children}</HeaderNavigation>
      </header>
      <SideNavigation isActive={isSideNavigationActive}>{props.sideNavChildren}</SideNavigation>
      <ScrollUpButton isVisible={!isScrollArrowHidden}></ScrollUpButton>
    </div>
  );
}
