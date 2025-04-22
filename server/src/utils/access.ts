import { AuthDto } from 'src/dtos/auth.dto';
import { Permission } from 'src/enum';
import { setIsSuperset } from 'src/utils/set';

export type GrantedRequest = {
  requested: Permission[];
  current: Permission[];
};

export const isGranted = ({ requested, current }: GrantedRequest) => {
  if (current.includes(Permission.ALL)) {
    return true;
  }

  return setIsSuperset(new Set(current), new Set(requested));
};

export type AccessRequest = {
  auth: AuthDto;
  permission: Permission;
  ids: Set<string> | string[];
};
