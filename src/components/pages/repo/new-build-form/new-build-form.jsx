import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
} from 'react';

import Button from 'components/shared/button';
import Form, { Field, FormSection } from 'components/shared/form';
import Switch from 'components/shared/switch';
import { useRepoBranches } from 'hooks/swr';

import css from './new-build-form.module.scss';

const cx = classNames.bind(css);

const NewBuildForm = ({
  handleSubmit,
  handleCancel,
  target,
  parameters,
  repoName,
}) => {
  const [state, setState] = useState({
    target,
    parameters,
  });
  const [parameterState, setParameterState] = useState({
    key: '',
    value: '',
  });
  const [isTextMode, setIsTextMode] = useState(false);

  // Define the deployment environment options
  const deploymentOptions = [
    { value: 'alpha', label: 'alpha' },
    { value: 'beta', label: 'beta' },
    { value: 'gamma', label: 'gamma' },
    { value: 'test', label: 'test' },
    { value: 'epsilon', label: 'epsilon' },
    { value: 'analytics-beta', label: 'analytics-beta' },
    { value: 'staging', label: 'staging' },
  ];

  // Add the DEPLOY_TO parameter when component mounts
  useEffect(() => {
    // Check if DEPLOY_TO parameter already exists
    const deployToExists = state.parameters.some((param) => param.key === 'DEPLOY_TO');

    if (!deployToExists) {
      setState((prev) => ({
        ...prev,
        parameters: [
          ...prev.parameters,
          { key: 'DEPLOY_TO', value: 'alpha', id: 'deploy-to-param' },
        ],
      }));
    }
  }, [state.parameters]);
  const handleAddParameter = () => {
    if (parameterState.key && parameterState.value) {
      setState(
        (prev) => ({
          ...prev,
          parameters: [...prev.parameters, { ...parameterState, id: Date.now() }],
        }),
      );
      setParameterState({ key: '', value: '' });
    }
  };

  const handleRemoveParameter = (id) => () => setState(
    (prev) => ({
      ...prev,
      parameters: prev.parameters.filter((param) => param.id !== id),
    }),
  );

  const handleParameterChange = (field) => (event) => {
    setParameterState((prev) => ({ ...prev, [field]: event.target.value.trim() }));
  };

  const handleSubmitMiddleware = (event) => {
    event.preventDefault();
    handleSubmit(state);
    handleCancel();
  };

  // This function is kept for potential future use with regular input fields
  // eslint-disable-next-line no-unused-vars
  const handleFieldChange = (field) => (event) => {
    setState((prev) => ({ ...prev, [field]: event.target.value.trim() }));
  };

  const handleFieldChangePatch = (field) => (event) => {
    setState((prev) => ({ ...prev, [field]: event }));
  };

  // Fetch branches for the repository
  const { data: branches, isLoading: branchesLoading } = useRepoBranches(repoName);

  // Convert branches to options format for the dropdown
  const branchOptions = branches && branches.length
    ? branches.map((branch) => ({
      value: branch,
      label: branch,
    }))
    : [];

  return (
    <Form className={cx('new-build-form')}>
      <FormSection className={cx('new-build-form-column')}>
        <div className={cx('branch-selection-container')}>
          <div className={cx('branch-input-container')}>
            {isTextMode ? (
              <Field.Input
                label="Branch"
                placeholder="Enter Branch Name"
                value={state.target}
                name="branch"
                width={400}
                onChange={(e) => handleFieldChangePatch('target')(e.target.value)}
              />
            ) : (
              <Field.SearchableSelect
                label="Branch"
                placeholder="Select Branch"
                value={state.target}
                options={branchOptions}
                loading={branchesLoading}
                width={400}
                onChange={handleFieldChangePatch('target')}
              />
            )}
          </div>
          <div className={cx('toggle-switch-container')}>
            <Switch
              id="branch-input-mode"
              checked={isTextMode}
              onChange={setIsTextMode}
            />
          </div>
        </div>
      </FormSection>
      <FormSection title="Parameters" className={cx('new-build-form-column')}>
        {state.parameters.length ? (
          <div className={cx('new-build-form-parameters-list')}>
            {state.parameters.map(({ key, value, id }) => {
              // Special handling for DEPLOY_TO parameter
              if (key === 'DEPLOY_TO') {
                return (
                  <div className={cx('new-build-form-parameters')} key={id}>
                    <Field.Input
                      value={key}
                      name={key}
                      readOnly
                    />
                    <Field.SearchableSelect
                      name="deploy-to-value"
                      value={value}
                      options={deploymentOptions}
                      width={200}
                      onChange={(selectedValue) => {
                        setState((prev) => ({
                          ...prev,
                          parameters: prev.parameters.map((param) => (
                            param.id === id ? { ...param, value: selectedValue } : param
                          )),
                        }));
                      }}
                    />
                  </div>
                );
              }

              // Default rendering for other parameters
              return (
                <div className={cx('new-build-form-parameters')} key={id}>
                  <Field.Input
                    value={key}
                    name={key}
                    readOnly
                  />
                  <Field.Input
                    name={value}
                    value={value}
                    readOnly
                  />
                  <Button theme="plain" type="button" onClick={handleRemoveParameter(id)}>Remove</Button>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className={cx('new-build-form-parameters-fields')}>
          <Field.Input
            name="newKey"
            placeholder="key"
            value={parameterState.key}
            onChange={handleParameterChange('key')}
          />
          <Field.Input
            name="newVal"
            placeholder="value"
            value={parameterState.value}
            onChange={handleParameterChange('value')}
          />
          <Button theme="plain" type="button" onClick={handleAddParameter}>+ Add</Button>
        </div>
      </FormSection>
      <FormSection className={cx('new-build-form-controls')}>
        <Button theme="primary" type="submit" onClick={handleSubmitMiddleware}>Create</Button>
        <Button theme="primary" type="button" onClick={handleCancel}>Cancel</Button>
      </FormSection>
    </Form>
  );
};

NewBuildForm.defaultProps = {
  target: '',
  parameters: [],
  repoName: '',
};

NewBuildForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  target: PropTypes.string,
  parameters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
      id: PropTypes.string,
    }),
  ),
  repoName: PropTypes.string,
};

export default NewBuildForm;
