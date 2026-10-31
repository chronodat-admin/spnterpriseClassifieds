import * as React from 'react';
import { ServiceContainer, SERVICE_KEYS } from '../services/ServiceContainer';
import { IListing, IPermissionCheck } from '../interfaces';
import { PermissionChecker } from '../permissions/PermissionChecker';
import { useAppContext } from './useAppContext';

interface IPermissionService {
  checker: PermissionChecker;
}

export interface IUsePermissionsResult extends IPermissionCheck {
  checker: PermissionChecker;
  isOwner: (listing?: IListing) => boolean;
  canPublish: (listing?: IListing) => boolean;
  canReserve: (listing?: IListing) => boolean;
  canMarkSold: (listing?: IListing) => boolean;
  hasRole: (role: string) => boolean;
}

export function usePermissions(listing?: IListing): IUsePermissionsResult {
  const appContext = useAppContext();
  const { serviceContainerReady } = appContext;

  const checker = React.useMemo(() => {
    if (!serviceContainerReady) {
      return new PermissionChecker(appContext);
    }
    try {
      const service = ServiceContainer.getInstance().resolve<IPermissionService>(SERVICE_KEYS.PermissionService);
      if (service.checker) {
        service.checker.updateContext(appContext);
        return service.checker;
      }
    } catch {
      /* fall through */
    }
    return new PermissionChecker(appContext);
  }, [appContext, serviceContainerReady]);

  React.useEffect(() => {
    checker.updateContext(appContext);
  }, [checker, appContext]);

  const permissions = React.useMemo(() => checker.check(listing), [checker, listing]);

  return {
    ...permissions,
    checker,
    isOwner: (l?: IListing) => checker.isOwner(l ?? listing),
    canPublish: (l?: IListing) => checker.canPublish(l ?? listing),
    canReserve: (l?: IListing) => checker.canReserve(l ?? listing),
    canMarkSold: (l?: IListing) => checker.canMarkSold(l ?? listing),
    hasRole: (role: string) => checker.hasRole(role)
  };
}
