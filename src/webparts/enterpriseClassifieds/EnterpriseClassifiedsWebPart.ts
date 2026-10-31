import '../../utils/patchTabster';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EnterpriseClassifiedsWebPartStrings';
import EnterpriseClassifieds from './components/EnterpriseClassifieds';
import { IEnterpriseClassifiedsProps } from './components/IEnterpriseClassifiedsProps';
import {
  applyWebPartHostStyles,
  loadAppStyles,
  removeAppLoadingState,
  removeBootstrapLoader,
  removeFullScreenLoader,
  removeSharePointLeftNavHidden,
  removeSharePointPageBarHidden,
  scheduleSharePointLeftNavHidden,
  stopSharePointEditChromeWatchdog,
  suspendImmersiveChromeObserver,
  unmarkSharePointEditMode,
  unmarkTeamsHostEnvironment
} from '../../utils/loadAppStyles';
import { patchTabsterInstance } from '../../utils/patchTabster';

export interface IEnterpriseClassifiedsWebPartProps {
  description: string;
}

export default class EnterpriseClassifiedsWebPart extends BaseClientSideWebPart<IEnterpriseClassifiedsWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private get _isTeamsHost(): boolean {
    return !!this.context.sdks.microsoftTeams;
  }

  private get _isEditMode(): boolean {
    return this.displayMode === DisplayMode.Edit;
  }

  public render(): void {
    patchTabsterInstance();
    removeFullScreenLoader();
    removeBootstrapLoader(this.domElement);
    removeAppLoadingState(this.domElement);
    stopSharePointEditChromeWatchdog();
    suspendImmersiveChromeObserver();

    unmarkSharePointEditMode();
    removeSharePointPageBarHidden();
    if (this._isTeamsHost) {
      removeSharePointLeftNavHidden();
    } else {
      scheduleSharePointLeftNavHidden();
    }
    applyWebPartHostStyles(this.domElement, this._isTeamsHost, this._isEditMode);

    const element: React.ReactElement<IEnterpriseClassifiedsProps> = React.createElement(
      EnterpriseClassifieds,
      {
        context: this.context,
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: this._isTeamsHost,
        userDisplayName: this.context.pageContext.user.displayName,
        displayMode: this.displayMode
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    patchTabsterInstance();
    loadAppStyles();

    removeSharePointPageBarHidden();
    if (this._isTeamsHost) {
      removeSharePointLeftNavHidden();
    } else {
      scheduleSharePointLeftNavHidden();
    }
    applyWebPartHostStyles(this.domElement, this._isTeamsHost, this._isEditMode);
    this._environmentMessage = this.context.isServedFromLocalhost
      ? strings.AppLocalEnvironmentSharePoint
      : strings.AppSharePointEnvironment;

    return Promise.resolve();
  }

  protected onDisplayModeChanged(_oldDisplayMode: DisplayMode): void {
    this.render();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    stopSharePointEditChromeWatchdog();
    unmarkSharePointEditMode();
    suspendImmersiveChromeObserver();
    removeAppLoadingState(this.domElement);
    removeBootstrapLoader(this.domElement);
    removeSharePointLeftNavHidden();
    removeSharePointPageBarHidden();
    unmarkTeamsHostEnvironment();
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
