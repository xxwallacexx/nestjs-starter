import React from 'react';

import { Button, ButtonProps } from '@react-email/components';

interface IButtonProps extends ButtonProps {}

export const IButton = ({ children, ...props }: IButtonProps) => (
  <Button
    {...props}
    className="py-3 px-8 border bg-blue-500 rounded-full no-underline hover:no-underline text-white hover:text-gray-50 font-bold uppercase"
  >
    {children}
  </Button>
);
