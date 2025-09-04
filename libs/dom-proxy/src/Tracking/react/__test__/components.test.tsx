import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import {
  TrackingRoot,
  TrackExposure,
  TrackClick,
  withExposureTracking,
  withClickTracking,
} from '../components';
import * as TrackerModule from '../../core/Tracker';
import * as HooksModule from '../hooks';

// Mock the tracker module
vi.mock('../../core/Tracker', () => ({
  initTracker: vi.fn(),
  getTracker: vi.fn(() => ({
    destroy: vi.fn(),
  })),
}));

// Mock the hooks module
vi.mock('../hooks', () => ({
  useExposureTracking: vi.fn(() => ({ current: null })),
  useClickTracking: vi.fn((eventData, onClick) => onClick || vi.fn()),
}));

describe('Tracking React Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('TrackingRoot', () => {
    it('should initialize tracker with config on mount', () => {
      const config = {
        endpoint: 'https://api.example.com/track',
        appId: 'test-app',
        userId: 'user-123',
      };

      render(
        <TrackingRoot config={config}>
          <div>Test content</div>
        </TrackingRoot>
      );

      expect(TrackerModule.initTracker).toHaveBeenCalledWith(config);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should destroy tracker on unmount', () => {
      const mockDestroy = vi.fn();
      vi.mocked(TrackerModule.getTracker).mockReturnValue({
        destroy: mockDestroy,
      } as any);

      const { unmount } = render(
        <TrackingRoot config={{ endpoint: 'test' }}>
          <div>Test</div>
        </TrackingRoot>
      );

      unmount();

      expect(TrackerModule.getTracker).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should handle destroy errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(TrackerModule.getTracker).mockImplementation(() => {
        throw new Error('Tracker not found');
      });

      const { unmount } = render(
        <TrackingRoot config={{ endpoint: 'test' }}>
          <div>Test</div>
        </TrackingRoot>
      );

      expect(() => unmount()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[TrackingRoot] 销毁错误:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('TrackExposure', () => {
    it('should render with default props', () => {
      const eventData = { eventName: 'test_exposure' };

      render(
        <TrackExposure eventData={eventData}>
          <span>Exposure content</span>
        </TrackExposure>
      );

      expect(screen.getByText('Exposure content')).toBeInTheDocument();
      expect(HooksModule.useExposureTracking).toHaveBeenCalledWith(
        eventData,
        { once: true, threshold: undefined }
      );
    });

    it('should pass custom options to hook', () => {
      const eventData = { eventName: 'test_exposure' };
      const options = { once: false, threshold: 0.5 };

      render(
        <TrackExposure eventData={eventData} {...options}>
          <span>Content</span>
        </TrackExposure>
      );

      expect(HooksModule.useExposureTracking).toHaveBeenCalledWith(
        eventData,
        options
      );
    });

    it('should render with custom component tag', () => {
      const eventData = { eventName: 'test_exposure' };

      render(
        <TrackExposure eventData={eventData} as="section" data-testid="custom-section">
          <span>Content</span>
        </TrackExposure>
      );

      expect(screen.getByTestId('custom-section').tagName).toBe('SECTION');
    });

    it('should pass through HTML attributes', () => {
      const eventData = { eventName: 'test_exposure' };

      render(
        <TrackExposure 
          eventData={eventData} 
          className="test-class" 
          data-testid="exposure-element"
        >
          <span>Content</span>
        </TrackExposure>
      );

      const element = screen.getByTestId('exposure-element');
      expect(element).toHaveClass('test-class');
    });
  });

  describe('TrackClick', () => {
    it('should render with click tracking', () => {
      const eventData = { eventName: 'test_click' };
      const mockClickHandler = vi.fn();

      vi.mocked(HooksModule.useClickTracking).mockReturnValue(mockClickHandler);

      render(
        <TrackClick eventData={eventData} data-testid="click-element">
          <button>Click me</button>
        </TrackClick>
      );

      const element = screen.getByTestId('click-element');
      fireEvent.click(element);

      expect(HooksModule.useClickTracking).toHaveBeenCalledWith(
        eventData,
        undefined
      );
      expect(mockClickHandler).toHaveBeenCalled();
    });

    it('should combine with existing onClick handler', () => {
      const eventData = { eventName: 'test_click' };
      const originalOnClick = vi.fn();
      const enhancedOnClick = vi.fn();

      vi.mocked(HooksModule.useClickTracking).mockReturnValue(enhancedOnClick);

      render(
        <TrackClick 
          eventData={eventData} 
          onClick={originalOnClick}
          data-testid="click-element"
        >
          <button>Click me</button>
        </TrackClick>
      );

      expect(HooksModule.useClickTracking).toHaveBeenCalledWith(
        eventData,
        originalOnClick
      );
    });

    it('should render with custom component tag', () => {
      const eventData = { eventName: 'test_click' };

      render(
        <TrackClick eventData={eventData} as="button" data-testid="custom-button">
          Click me
        </TrackClick>
      );

      expect(screen.getByTestId('custom-button').tagName).toBe('BUTTON');
    });
  });

  describe('withExposureTracking HOC', () => {
    it('should enhance component with exposure tracking', () => {
      const TestComponent: React.FC<{ title: string }> = ({ title }) => (
        <div>{title}</div>
      );

      const eventData = { eventName: 'hoc_exposure' };
      const EnhancedComponent = withExposureTracking(TestComponent, eventData);

      render(<EnhancedComponent title="Test Title" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(HooksModule.useExposureTracking).toHaveBeenCalledWith(
        eventData,
        {}
      );
    });

    it('should pass options to exposure tracking', () => {
      const TestComponent: React.FC<{ title: string }> = ({ title }) => (
        <div>{title}</div>
      );

      const eventData = { eventName: 'hoc_exposure' };
      const options = { once: false, threshold: 0.8 };
      const EnhancedComponent = withExposureTracking(TestComponent, eventData, options);

      render(<EnhancedComponent title="Test Title" />);

      expect(HooksModule.useExposureTracking).toHaveBeenCalledWith(
        eventData,
        options
      );
    });

    it('should preserve component props', () => {
      interface TestProps {
        title: string;
        subtitle?: string;
      }

      const TestComponent: React.FC<TestProps> = ({ title, subtitle }) => (
        <div>
          <h1>{title}</h1>
          {subtitle && <h2>{subtitle}</h2>}
        </div>
      );

      const eventData = { eventName: 'hoc_exposure' };
      const EnhancedComponent = withExposureTracking(TestComponent, eventData);

      render(<EnhancedComponent title="Main Title" subtitle="Sub Title" />);

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Sub Title')).toBeInTheDocument();
    });
  });

  describe('withClickTracking HOC', () => {
    it('should enhance component with click tracking', () => {
      const TestComponent: React.FC<{ 
        title: string; 
        onClick?: React.MouseEventHandler 
      }> = ({ title, onClick }) => (
        <button onClick={onClick}>{title}</button>
      );

      const eventData = { eventName: 'hoc_click' };
      const enhancedOnClick = vi.fn();
      
      vi.mocked(HooksModule.useClickTracking).mockReturnValue(enhancedOnClick);

      const EnhancedComponent = withClickTracking(TestComponent, eventData);

      render(<EnhancedComponent title="Click me" />);

      const button = screen.getByText('Click me');
      fireEvent.click(button);

      expect(HooksModule.useClickTracking).toHaveBeenCalledWith(
        eventData,
        undefined
      );
      expect(enhancedOnClick).toHaveBeenCalled();
    });

    it('should combine with existing onClick handler', () => {
      const TestComponent: React.FC<{ 
        title: string; 
        onClick?: React.MouseEventHandler 
      }> = ({ title, onClick }) => (
        <button onClick={onClick}>{title}</button>
      );

      const eventData = { eventName: 'hoc_click' };
      const originalOnClick = vi.fn();
      const enhancedOnClick = vi.fn();
      
      vi.mocked(HooksModule.useClickTracking).mockReturnValue(enhancedOnClick);

      const EnhancedComponent = withClickTracking(TestComponent, eventData);

      render(<EnhancedComponent title="Click me" onClick={originalOnClick} />);

      expect(HooksModule.useClickTracking).toHaveBeenCalledWith(
        eventData,
        originalOnClick
      );
    });

    it('should preserve component props', () => {
      interface TestProps {
        title: string;
        disabled?: boolean;
        onClick?: React.MouseEventHandler;
      }

      const TestComponent: React.FC<TestProps> = ({ title, disabled, onClick }) => (
        <button disabled={disabled} onClick={onClick}>
          {title}
        </button>
      );

      const eventData = { eventName: 'hoc_click' };
      const EnhancedComponent = withClickTracking(TestComponent, eventData);

      render(<EnhancedComponent title="Disabled Button" disabled={true} />);

      const button = screen.getByText('Disabled Button');
      expect(button).toBeDisabled();
    });
  });
});
