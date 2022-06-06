import React from 'react';
import { Input, InputProps } from '@skbkontur/react-ui/components/Input';

import { ValidationContainer, ValidationWrapper } from '../../../../src';
import { Form } from '../../../Common/Form';

type ConditionalValidationDemoState = Required<Pick<InputProps, 'value'>>;
export default class ConditionalValidationDemo extends React.Component {
  public state: ConditionalValidationDemoState = {
    value: '',
  };

  public render() {
    const { value } = this.state;

    const validationInfo = !/^\d*$/.test(value) ? { message: 'Только цифры' } : null;

    return (
      <ValidationContainer>
        <Form>
          <Form.Line title="Номер">
            <ValidationWrapper validationInfo={validationInfo}>
              <Input
                placeholder={'Только цифры'}
                value={value}
                onValueChange={(v) => this.setState({ value: v })}
              />
            </ValidationWrapper>
          </Form.Line>
        </Form>
      </ValidationContainer>
    );
  }
}
