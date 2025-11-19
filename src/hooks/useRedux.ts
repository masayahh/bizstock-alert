/**
 * Redux Hooks
 *
 * Typed hooks for Redux store access.
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

/**
 * Typed useDispatch hook (react-redux v8 compatible)
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook (react-redux v8 compatible)
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
